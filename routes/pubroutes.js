'use strict';

const debug = require('debug')('beershots:pub-routes');
const pubs = require('../dao/pubs.js');
const sanitizer = require('sanitize-html');

const PubRoutes = function () {
};

PubRoutes.createRoutes = function (self) {

    self.app.get('/pub/:pid', (req, res, next) => {

        let pid = sanitizer(req.params.pid);
        pid = parseFloat(pid);

        debug( "Getting pub %d" , pid );
        pubs.getOne(pid, (result) => {
            res.render('pub', { layout: 'min-map', pub: result[0] });
        });

    });

    self.app.get('/pubs/:latitude/:longitude', (req, res, next) => {
        let latitude = sanitizer(req.params.latitude);
        let longitude = sanitizer(req.params.longitude);


        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        debug("Getting pubs in %d,%d" , latitude , longitude );
        pubs.getNear(latitude, longitude, (result) => {
            res.render('publist', { layout: 'min-map', pubs: result, latitude , longitude });
        });

    });
}

module.exports = PubRoutes;