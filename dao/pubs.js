var debug = require('debug')('beershots:pubsdao');
var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Pubs = function () {
};

/**
 * Get all the pubs
 * @param done function to call with the results
 */
Pubs.getAll = function( done ) {
    debug('Getting all pubs');
    dbhelper.getAllFromTable("pubs" , done , null);
}

Pubs.getNear = function( latitude , longitude , done) {
    debug('getting pubs near : ' + latitude + " : " + longitude );
    var sql = "SELECT pid , name , latitude , longitude," +
                " ST_Distance(the_geom, ST_MakePoint( $1, $2 ) ) as distance" +
                " FROM pubs" +
                " ORDER BY the_geom <->  ST_MakePoint( $1, $2 ) " +
                " LIMIT 15;";
    var params = [ longitude, latitude ];

    dbhelper.query( sql , params ,
        function( result ) {
            done( result );
        },
        function(error) {
            done(null , error );
        });
};

/**
 * Get one pub
 * @param pid
 * @param done
 */
Pubs.getOne = function( pid , done) {
    debug('getting pub : ' + pid);
    var sql = "SELECT *" +
        " FROM pubs" +
        " where pid=$1";
    var params = [ pid ];

    dbhelper.query( sql , params ,
        function( result ) {
            done( result );
        },
        function(error) {
            done(null , error );
        });
};

/**
 * Add a new pub
 * @param name Name of the stack to add
 * @done function to call with the result
 */
Pubs.add = function ( name, description, done) {
    var sql = "INSERT INTO pubs ( name, description ) values ( $1 , $2 ) returning id";
    var params = [ name, description ];

    dbhelper.insert( sql, params ,
        function( result ) {
            done( result.rows[0].id );
        },
        function(error) {
            console.log(error);
            done(null , error );
        } );
}

/**
 * Delete a set of pubs using their ID numbers
 * @param ids
 * @param done
 */
Pubs.delete = function (ids, done) {
    dbhelper.deleteByIds( "pubs" , ids , done );
}

module.exports = Pubs;