// Load in the environment variables
require('dotenv').config({ path: 'process.env' });

var pg = require('pg');
var async = require('async');
var osmread = require('osm-read');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

var parser = osmread.parse({
    filePath: './osmdata/plymouth.xml',
    endDocument: function () {
        console.log('document end');
    },
    bounds: function (bounds) {
        console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            //console.log(JSON.stringify(node));
            var pubName = node.tags.name.replace(/'/g, "\''");

            if(node.lat!=undefined) {
                var sql = "insert into pubs (name,latitude,longitude, the_geom) values ( '"
                    + pubName + "',"
                    + node.lat + ","
                    + node.lon + ","
                    + "'(" + node.lat + "," + node.lon + ")' )";
                doQuery(sql, function (result) {
                    console.log("Inserted : " + result);
                })
            }
        }
    },
    way: function (node) {
        if (node.tags.name != undefined && node.tags.amenity == 'pub') {
            //console.log(JSON.stringify(node));
            var pubName = node.tags.name.replace(/'/g, "\''");

            if(node.lat!=undefined) {
                var sql = "insert into pubs (name,latitude,longitude, the_geom) values ( '"
                    + pubName + "',"
                    + node.lat + ","
                    + node.lon + ","
                    + "'(" + node.lat + "," + node.lon + ")' )";
                doQuery(sql, function (result) {
                    console.log("Inserted : " + result);
                })
            }
        }
    },
    error: function (msg) {
        console.log('error: ' + msg);
    }
});



function doQuery (item, callback) {
    console.log("Query:" + item);
    client.query(item, function (err, result) {
        callback(err);
    })
}

