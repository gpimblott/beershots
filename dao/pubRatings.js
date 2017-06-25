"use strict";

/**
 * Created by gordo on 25/06/2017.
 */
const debug = require('debug')("beershots:pubratingdao");
const pg = require('pg');
const dbhelper = require("../utils/dbhelper.js");

const PubRatings = function () {
};


/**
 * Add a new pub
 * @param name Name of the stack to add
 * @done function to call with the result
 */
PubRatings.add = function (user, pubId, rating, done) {
    const sql = "INSERT INTO pub_ratings ( uid, pid, rating ) values ( $1 , $2 , $3 ) " +
            " ON CONFLICT ON CONSTRAINT uc_user_rating DO UPDATE SET rating = $3";
    const params = [user, pubId, rating];

    dbhelper.insert(sql, params,
        (result) => {
            done(null , null);
        },
        (error) => {
            debug(error);
            done(null, error);
        });
}

module.exports = PubRatings;