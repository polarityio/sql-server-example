'use strict';

let ConnectionPool = require('tedious-connection-pool');
let Request = require('tedious').Request;
let Connection = require('tedious').Connection;
let TYPES = require('tedious').TYPES;
let _ = require('lodash');
let async = require('async');
let Logger;
let pool;
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

    _initConnectionPool(options);

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
}

function _initConnectionPool(integrationOptions) {
    if (typeof pool === 'undefined') {
        let dbOptions = _getConnectionOptions(integrationOptions);
        pool = new ConnectionPool(CONNECTION_POOL_CONFIG, dbOptions);
        pool.on('error', function (err) {
            Logger.error({err: err}, 'Connection Pool Error');
        });
    }
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

    Logger.info({dbOptions:dbOptions}, 'Database Connection Options');

    return dbOptions;
}

function _lookupHostname(entityObj, options, connection, cb) {
    //let sql = "SELECT * FROM mytable WHERE value = @entity";
    let sql = "SELECT TOP 2 id, imdb_id, title, movie_year FROM omdb";
    let rows = [];

    let request = new Request(sql, function (err, rowCount) {
        if(err){
            Logger.error({err:err}, 'Error running sql statement');
            cb(err);
            return;
        }else{
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
        }
    });

    //request.addParameter('entity', TYPES.VarChar, entityObj.value);

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