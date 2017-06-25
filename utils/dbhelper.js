'use strict';

const debug = require('debug')('beershots:dbhelper');

/**
 * Helper function to perform base database operations (e.g. query, insert)
 */
const pg = require('pg');

const DBHelper = function () {
};

/**
 * Perform a select query operation
 * @param sql Statement to perform
 * @param parameters Parameters for the query
 * @param done Function to call on success
 * @param error Function to call on error
 */
DBHelper.query = function (sql, parameters, done, error) {
    if (process.env.USE_SSL && process.env.USE_SSL.toLowerCase() !== 'false') {
        debug('Using SSL');
        pg.defaults.ssl = true;
    }

    pg.defaults.poolSize = 50;

    debug("Connecting to %s" , process.env.DATABASE_URL);
    pg.connect(process.env.DATABASE_URL, (err, client) => {
        const results = [];

        // Handle connection errors
        if (err) {
            if (client) {
                client.end();
            }
            debug("Error : %s", err);
            error(err);
            return;
        }

        try {
            debug("SQL : %s", sql);
            const query = client.query(sql, parameters);

            query.on('row', (row) => {
                results.push(row);
            });

            query.on('error', ( err ) => {
                debug(err);
                client.end();
                error(err);
            });

            // After all data is returned, close connection and return results
            query.on('end', () => {
                client.end();
                done(results);
            });
        } catch (err) {
            debug("Error detected during query");
            client.end();
            error(err);
        }

    });
}

/**
 * Perform an insert operation on the database
 * @param sql Statement to perform
 * @param parameters Parameters for the query
 * @param done Function to call on exit
 * @param error Error function to call on error
 */
DBHelper.insert = function (sql, parameters, done, error) {
    if (process.env.USE_SSL && process.env.USE_SSL.toLowerCase() !== 'false') {
        pg.defaults.ssl = true;
    }

    pg.connect(process.env.DATABASE_URL, (err, client) => {
        // Handle connection errors
        if (err) {
            if (client) {
                client.end();
            }
            error(err);
            return;
        }

        client.query(sql, parameters,
            (err, result) => {
                if (err) {
                    error(err)
                } else {
                    client.end();
                    done(result);
                }
            });
    });
};

/**
 * Wrapper around delete function to delete by a set of ids
 * @param tableName
 * @param ids array of IDS to delete
 * @param done function to call on completion
 */
DBHelper.deleteByIds = function (tableName, ids, done) {

    const params = [];
    for (let i = 1; i <= ids.length; i++) {
        params.push('$' + i);
    }

    const sql = "DELETE FROM " + tableName + " WHERE id IN (" + params.join(',') + "  )";

    DBHelper.query(sql, ids,
        (result) => {
            done(true);
        },
        (error) => {
            debug(error);
            done(false, error);
        });

}

/**
 * get all of the rows and columns from the specified table
 * @param tableName
 * @param done
 * @param order
 */
DBHelper.getAllFromTable = function (tableName, done, order) {
    let sql = "SELECT * FROM " + tableName;
    const params = [];

    if (order !== null) {
        sql += " ORDER BY $1";
        params.push(order);
    }

    DBHelper.query(sql, params,
        (results) => {
            done(results);
        },
        (error) => {
            debug(error);
            done(null);
        });
}

module.exports = DBHelper;