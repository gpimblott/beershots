"use strict";

/**
 * Created by gordo on 25/06/2017.
 */
var debug = require('debug')("beershots:pubratingdao");
var pg = require('pg');
var dbhelper = require("../utils/dbhelper.js");

var PubRatings = function () {
};


/**
 * Add a new pub
 * @param name Name of the stack to add
 * @done function to call with the result
 */
PubRatings.add = function (user, pubId, rating, done) {
    var sql = "INSERT INTO pub_ratings ( uid, pid, rating ) values ( $1 , $2 , $3 ) " +
            " ON CONFLICT ON CONSTRAINT uc_user_rating DO UPDATE SET rating = $3";
    var params = [user, pubId, rating];

    dbhelper.insert(sql, params,
        function (result) {
            done(null , null);
        },
        function (error) {
            debug(error);
            done(null, error);
        });
}

module.exports = PubRatings;