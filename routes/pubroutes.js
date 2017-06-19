'use strict';

var debug = require('debug')('beershots:pub-routes');
var pubs = require('../dao/pubs.js');
var sanitizer = require('sanitize-html');

var PubRoutes = function () {
};

PubRoutes.createRoutes = function (self) {

    self.app.get('/pub/:pid', function (req, res, next) {
        var pid = sanitizer(req.params.pid);

        pid = parseFloat(pid);

        pubs.getOne(pid, function (result) {
            console.log(result);
            res.render('pub', { layout: 'min-map', pub: result[0] });
        });

    });

    self.app.get('/pubs/:latitude/:longitude', function (req, res, next) {
        var latitude = sanitizer(req.params.latitude);
        var longitude = sanitizer(req.params.longitude);

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        pubs.getNear(latitude, longitude, function (result) {
            res.render('publist', { layout: 'min-map', pubs: result, latitude: latitude , longitude: longitude });
        });

    });
}

module.exports = PubRoutes;