"use strict";

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
    filePath: './osmdata/cornwall.osm.pbf',
    endDocument: function () {
        //console.log('document end');
    },
    bounds: function (bounds) {
        console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            // console.log("node:" + JSON.stringify(node));
            const pubName = node.tags.name.replace(/'/g, "\''");
            const city = node.tags[ 'addr:city' ];
            const street = node.tags[ 'addr:street' ];
            const postcode = node.tags[ 'addr:postcode' ];
            const url = node.tags.website || node.tags.facebook;

            storePub(pubName, street, city, postcode, node.lat, node.lon, url);
        }
    },
    way: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            // console.log("Way:" + JSON.stringify(node));
            const pubName = node.tags.name.replace(/'/g, "\''");
            const city = node.tags[ 'addr:city' ];
            const street = node.tags[ 'addr:street' ];
            const postcode = node.tags[ 'addr:postcode' ];
            const url = node.tags.website || node.tags.facebook;

            storePub(pubName, street, city, postcode, node.lat, node.lon, url);
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
function storePub (pubName, street, city, postcode, latitude, longitude, website) {
    console.log(pubName + ":" + street + ":" + city + ":" + postcode + ":" + latitude + ":" + longitude);

    if (latitude === undefined && postcode!==undefined) {
        storeByPostcode(postcode, pubName, website);
        return
    }


    let columns = "name,latitude,longitude, the_geom";
    let values = "'" + pubName + "',"
        + latitude + ","
        + longitude + ","
        + "ST_GeographyFromText('SRID=4326;POINT(" + longitude + " " + latitude + ")')";

    if (website !== undefined) {
        columns += ",url";
        values += ", '" + website + "'";
    }

    if(street !== undefined) {
        columns += ",street";
        values += ",'" + street + "'";
    }

    if(city !== undefined) {
        columns += ",town";
        values += ",'" + city + "'";
    }

    if(postcode !== undefined) {
        columns += ",postcode";
        values += ",'" + postcode + "'";
    }

    const sql = "insert into pubs ( " + columns + " ) values ( " + values + ")\n";

    console.log( sql );
    client.query(sql, function (result) {
        numPubs++;
        console.log(" ** Inserted ** (" + numPubs + "): " + sql);
    })
}

/**
 * Look up the record by postcode and store
 * @param postcode
 * @param data
 */
function storeByPostcode (postcode, pubName, website) {
    if(postcode===undefined){
        console.log("Postcode not defined - skipping");
        return;
    }

    const options = {
        host: 'api.postcodes.io',
        path: '/postcodes/' + encodeURI(postcode)
    };

    const callback = function (response) {
        let str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            const address = JSON.parse(str);
            if (address.result !== undefined && address.result.latitude !== undefined ) {
                const latitude = address.result.latitude;
                const longitude = address.result.longitude;
                const city = address.result.primary_care_trust;
                const postcode = address.result.postcode;
                const street = undefined;

                storePub(pubName, street, city, postcode, latitude, longitude, website);
            } else {
                console.log("No location for postcode : " + postcode)
                console.log(address);
            }
        });
    }

    http.request(options, callback).end();
}

