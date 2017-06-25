"use strict";

const debug = require('debug')('beershots:pubsdao');
const pg = require('pg');
const dbhelper = require('../utils/dbhelper.js');

const Pubs = function () {
};

/**
 * Get all the pubs
 * @param done function to call with the results
 */
Pubs.getAll = function (done) {
    debug("Getting all pubs");
    dbhelper.getAllFromTable("pubs", done, null);
}

Pubs.getNear = function (latitude, longitude, done) {
    debug("getting pubs near : " + latitude + " : " + longitude);
    const sql = "SELECT pid ,name ,rating ,latitude , longitude," +
        " ST_Distance(the_geom, ST_MakePoint( $1, $2 ) ) as distance" +
        " FROM pubs" +
        " WHERE ST_Distance(the_geom, ST_MakePoint( $1, $2 ) ) < 2000" +
        " ORDER BY the_geom <->  ST_MakePoint( $1, $2 ) ";
    const params = [longitude, latitude];

    dbhelper.query(sql, params,
        (result) => {
            done(result);
        },
        (error) => {
            done(null, error);
        });
};

/**
 * Get one pub
 * @param pid
 * @param done
 */
Pubs.getOne = function (pid, done) {
    debug("getting one pub : " + pid);
    const sql = "SELECT pubs.*, " +
        "(select avg(rating) from pub_ratings where pid=$1 group by pid ) as average_rating," +
        "(select count(rating) from pub_ratings where pid=$1) as total_reviews" +
        " FROM pubs" +
        " where pid=$1";
    const params = [pid];

    dbhelper.query(sql, params,
        (result) => {
            done(result);
        },
        (error) => {
            done(null, error);
        });
};

/**
 * Add a new pub
 * @param name Name of the stack to add
 * @done function to call with the result
 */
Pubs.add = function (name, description, done) {
    const sql = "INSERT INTO pubs ( name, description ) values ( $1 , $2 ) returning id";
    const params = [name, description];

    dbhelper.insert(sql, params,
        (result) => {
            done(result.rows[0].id);
        },
        (error) => {
            console.log(error);
            done(null, error);
        });
}

/**
 * Delete a set of pubs using their ID numbers
 * @param ids
 * @param done
 */
Pubs.delete = function (ids, done) {
    dbhelper.deleteByIds("pubs", ids, done);
}

module.exports = Pubs;