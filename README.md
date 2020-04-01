# Polarity SQL Server Example Integration

This integration is a framework to allow you to create customized integrations for connecting to and executing queries against SQL Server.  Note that this integration is meant as a template for
creating your own custom integrations and has not been designed to run as in a production environment.

## SQL Server Example Integration Options

### Database Host

The hostname of the server hosting your SQL Server instance

### Database Port

The port your data instance is listening on (defaults to 1433).

### Database Name

The name of the database you are connecting to

### Windows Username

The windows username that you are authenticating as

### Users Password

The password of the user you are authenticating as

### Windows Domain

The domain the database is running under (e.g., WORKGROUP)

### Query

The query you want to execute and return data for. Replace the entity with "@entity". 

```
SELECT * FROM data WHERE ip = @entity
```

In the example query above, the variable `@entity` will be replaced with an IPv4 address from the user's screen.

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
