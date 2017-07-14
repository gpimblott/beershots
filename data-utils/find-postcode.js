/**
 * Utility to take the raw OSM data and try and assign addresses to the pubs
 */
require('dotenv').config({ path: '../process.env' });

const http = require('http');

const db = require("../utils/dbhelper");

const sql = "Select * from pubs limit 1";
const params = [];

db.query(sql, params, (result) => {
        console.log(result);
        var pub = result[0];
        lookupPostcode(pub.latitude , pub.longitude, (address)=>{
            console.log(address);
        } )
    },
    (error) => {
        console.log(error);
    }
);

/**
 * Store the pub in the database
 * @param pubName
 * @param latitude
 * @param longitude
 */
function storePub (pubName, latitude, longitude, website) {
    var columns = "name,latitude,longitude, the_geom";
    var values = "'" + pubName + "',"
        + latitude + ","
        + longitude + ","
        + "ST_GeographyFromText('SRID=4326;POINT(" + longitude + " " + latitude + ")')";

    if (website != undefined) {
        columns += ",url";
        values += ", '" + website + "'";
    }

    var sql = "insert into pubs ( " + columns + " ) values ( " + values + ")";

    client.query(sql, function (result) {
        console.log("Inserted (" + numPubs + "): " + sql);
    })
}

/**
 * Lookup the postcode for the location
 * @param latitude
 * @param longitude
 * @param pid
 */
function lookupPostcode (latitude, longitude , done) {

    var options = {
        host: 'api.postcodes.io',
        path: '/postcodes?lon=' + longitude + '&lat=' + latitude
    };

    console.log(longitude + ":" + latitude);

    callback = function (response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            var address = JSON.parse(str);
            done(address);
        });
    }

    http.request(options, callback).end();
}

