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
    const params = [ longitude, latitude ];

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
Pubs.getOne = function (pid, uid, done) {
    debug("getting one pub : " + pid);
    const sql = "SELECT pubs.*, " +
        "(select avg(rating) from pub_ratings where pid=$1 group by pid ) as average_rating," +
        "(select count(rating) from pub_ratings where pid=$1) as total_reviews, " +
        " pub_ratings.rating as my_rating" +
        " FROM pubs" +
        " LEFT JOIN pub_ratings ON pubs.pid=pub_ratings.pid and pub_ratings.uid=$2" +
        " where pubs.pid=$1";
    const params = [ pid, uid ];

    dbhelper.query(sql, params,
        (result) => {
            done(result);
        },
        (error) => {
            done(null, error);
        });
};

/**
 * Get a random pub id
 * @param done
 */
Pubs.getRandomId = function (done) {
    debug("getting random pub");
    const sql = "SELECT pid FROM pubs ORDER BY RANDOM() LIMIT 1";

    const params = [];

    dbhelper.query(sql, params,
        (result) => {
            done(result[0]);
        },
        (error) => {
            done(null, error);
        });
};

/**
 * Get the number of people who voted for each star
 */
Pubs.getRatingStatsForPub = function (pid, done) {
    const sql = "select count(*),rating from pub_ratings where pid=$1 group by rating order by rating desc;"
    const params = [ pid ];

    dbhelper.query(sql, params,
        (result) => {
            done(result);
        },
        (error) => {
            done(null, error);
        });
}

/**
 * Update the overall rating for a pub
 */
Pubs.refreshRatingStatsForPub = function (pid, done) {
    const sql = "UPDATE pubs set rating = " +
        " ( SELECT (SUM(totals) / (SELECT COUNT(pid) as votes FROM pub_ratings WHERE pid=$1)) as score " +
        " FROM ( " +
        " SELECT COUNT(rating)*rating as totals FROM pub_ratings WHERE pid=$1 GROUP BY rating) totals) " +
        " WHERE pid=$1"

    const params = [ pid ];

    dbhelper.insert(sql, params,
        (result) => {
            done(result);
        },
        (error) => {
            done(null, error);
        });
}

/**
 * Add a new pub
 * @param name Name of the stack to add
 * @done function to call with the result
 */
Pubs.add = function (name, description, done) {
    const sql = "INSERT INTO pubs ( name, description ) values ( $1 , $2 ) returning id";
    const params = [ name, description ];

    dbhelper.insert(sql, params,
        (result) => {
            done(result.rows[ 0 ].id);
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