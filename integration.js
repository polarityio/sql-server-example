'use strict';

let ConnectionPool = require('tedious-connection-pool');
let Request = require('tedious').Request;
let Connection = require('tedious').Connection;
let TYPES = require('tedious').TYPES;
let _ = require('lodash');
let async = require('async');
let Logger;
let pool;
let poolOptions;

const CONNECTION_POOL_CONFIG = {
    min: 2,
    max: 4,
    log: true
};

function startup(logger) {
    Logger = logger;
}

function doLookup(entities, options, cb) {
    let lookupResults = [];

    Logger.trace({entities:entities}, 'doLookup');

    _initConnectionPool(options, function(err){
        if(err){
            cb(err);
            return;
        }

        async.each(entities, function (entityObj, next) {
            if (entityObj.types.indexOf('custom.hostname') >= 0) {
                pool.acquire(function (err, connection) {
                    Logger.trace("Lookup Hostname");
                    _lookupHostname(entityObj, options, connection, function (err, result) {
                        Logger.trace({result:result}, "Got SQL Result");
                        connection.release();
                        if (err) {
                            next(err);
                        } else {
                            lookupResults.push(result);
                            next(null);
                        }
                    });
                });
            } else {
                next(null);
            }
        }, function (err) {
            Logger.trace({lookupResults:lookupResults}, 'Lookup Results');
            cb(err, lookupResults);
        });
    });
}

function _initConnectionPool(integrationOptions, cb) {
    if (typeof poolOptions === 'undefined') {
        poolOptions = _getConnectionOptions(integrationOptions);
    }

    let newOptions = _getConnectionOptions(integrationOptions);

    if (typeof pool === 'undefined' || _optionsHaveChanged(poolOptions, newOptions)) {
        async.waterfall([
            function(next){
                if(pool){
                    Logger.info("Draining Connection Pool");
                    pool.drain(next);
                }else{
                    next();
                }
            },
            function(next){
                poolOptions = newOptions;
                Logger.info({options:poolOptions}, "Creating New Connection Pool");
                pool = new ConnectionPool(CONNECTION_POOL_CONFIG, poolOptions);
                pool.on('error', function (err) {
                    Logger.error({err: err}, 'Connection Pool Error');
                });
                next();
            }
        ], function(err){
            cb(err);
        });
    }else{
        cb();
    }
}

/**
 * Compares two javascript object literals and returns true if they are the same, false if not.  Is used
 * to determine if a user has changed Redis connection options since the last lookup.
 *
 * @param options1
 * @param options2
 * @returns {boolean}
 * @private
 */
function _optionsHaveChanged(options1, options2) {
    return !_.isEqual(options1, options2);
}

function _getConnectionOptions(options) {

    let dbOptions = {
        userName: options.user,
        password: options.password,
        server: options.host,
        options: {
            port: options.port,
            database: options.database,
            encrypt: true
        }
    };

    if (options.domain) {
        dbOptions.domain = options.domain;
    }

    return dbOptions;
}

function _lookupHostname(entityObj, options, connection, cb) {

    let sql = "SELECT TOP 2 id, imdb_id, title, runtime FROM omdb WHERE title LIKE @entity";
    let rows = [];

    let request = new Request(sql, function (err, rowCount) {
        if(err){
            Logger.error({err:err}, 'Error running sql statement');
            cb(err);
            return;
        }else{
            if(rowCount > 0){
                // The lookup results returned is an array of lookup objects with the following format
                cb(null, {
                    // Required: This is the entity object passed into the integration doLookup method
                    entity: entityObj,
                    // Required: An object containing everything you want passed to the template
                    data: {
                        // Required: These are the tags that are displayed in your template
                        summary: [rowCount + ' rows'],
                        // Data that you want to pass back to the notification window details block
                        details: {
                            rowCount: rowCount,
                            rows: rows
                        }
                    }
                });
            }else{
                // cache the miss
                cb(null, {entity:entityObj, data: null});
            }

        }
    });

    request.addParameter('entity', TYPES.VarChar, '%' + entityObj.value + '%');

    request.on('row', function(columns){
        let row = {};
        columns.forEach(function(column) {
            row[column.metadata.colName] = column.value;
        });
        rows.push(row);
    });

    connection.execSql(request);
}

module.exports = {
    doLookup: doLookup,
    startup: startup
};