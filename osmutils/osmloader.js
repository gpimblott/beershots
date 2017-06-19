// Load in the environment variables
require('dotenv').config({ path: 'process.env' });

var http = require('http');

var pg = require('pg');
var async = require('async');
var osmread = require('osm-read');

var numPubs = 0;

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

var parser = osmread.parse({
    filePath: './osmdata/bristol.osm.pbf',
    endDocument: function () {
        //console.log('document end');
    },
    bounds: function (bounds) {
        console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            // console.log("node:" + JSON.stringify(node));
            var pubName = node.tags.name.replace(/'/g, "\''");

            if (node.lat != undefined) {
                storePub(pubName, node.lat, node.lon, node.tags.website);
            } else {
                console.log("Unable to store ** No position ** : " + JSON.stringify(node));
            }
        }
    },
    way: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            //  console.log("Way:" + JSON.stringify(node));
            var pubName = node.tags.name.replace(/'/g, "\''");

            if (node.lat != undefined) {
                console.log("Latitude found");
                storePub(pubName, node.lat, node.lon , node.website );
                storePub(pubName, node.lat, node.lon , node.website );
            } else if (node.tags[ 'addr:postcode' ] != undefined) {
                storeByPostcode(node.tags[ 'addr:postcode' ], pubName , node.tags.website || node.tags.facebook);
            } else {
                console.log("Unable to store ** No position ** : " + JSON.stringify(node));
            }
        }
    },
    error: function (msg) {
        console.log('error: ' + msg);
    }
});

/**
 * Store the pub in the database
 * @param pubName
 * @param latitude
 * @param longitude
 */
function storePub (pubName, latitude, longitude  ,website ) {
    var columns = "name,latitude,longitude, the_geom";
    var values =  "'" + pubName + "',"
        + latitude + ","
        + longitude + ","
        + "ST_GeographyFromText('SRID=4326;POINT(" + longitude + " " + latitude + ")')";

    if(website != undefined ) {
        columns += ",url";
        values += ", '" + website+ "'";
    }

    var sql = "insert into pubs ( "+ columns + " ) values ( " + values + ")";


    client.query(sql, function (result) {
        numPubs++;
        console.log("Inserted (" + numPubs + "): " + sql);
    })
}

/**
 * Look up the record by postcode and store
 * @param postcode
 * @param data
 */
function storeByPostcode (postcode, pubName , website) {

    var options = {
        host: 'api.postcodes.io',
        path: '/postcodes/' + encodeURI(postcode)
    };

    callback = function (response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            var address = JSON.parse(str);
            if (address.result != undefined && address.result.latitude != undefined && address.result.longitude != undefined) {
                storePub(pubName, address.result.latitude, address.result.longitude , website);
            } else {
                console.log("No position for postcode : " + postcode)
                console.log(address);
            }
        });
    }

    http.request(options, callback).end();
}

