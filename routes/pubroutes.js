'use strict';

var debug = require('debug')('beershots:pub-routes');
var pubs = require('../dao/pubs.js');
var sanitizer = require('sanitize-html');

var PubRoutes = function () {
};

PubRoutes.createRoutes = function (self) {

    self.app.get('/pubs/:latitude/:longitude', function (req, res, next) {
        var latitude = sanitizer(req.params.latitude);
        var longitude = sanitizer(req.params.longitude);

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        pubs.getNear(latitude, longitude, function (result) {
            res.render('publist', { layout: 'main-map', pubs: result, latitude: latitude , longitude: longitude });
        });

    });
}

module.exports = PubRoutes;