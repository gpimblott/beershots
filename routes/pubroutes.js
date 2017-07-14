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

        if( isNaN(pid)) {
            debug("Pub id was NaN");
            res.redirect("/");
            res.end();
            return;
        }

        debug( "Getting pub %d" , pid );
        pubs.getOne(pid, req.user.id, (pubResult) => {
            pubs.getRatingStatsForPub( pid , (ratingResult) => {
                const pubDetails = pubResult[0];
                pubDetails.ratings = ratingResult;
                res.render('pub', {layout: 'min-map', pub: pubDetails});
            })
        });

    });

    /**
     * get a random pub
     */
    self.app.get('/pub/', (req, res, next) => {

        pubs.getRandomId( (result)=> {
            debug(result);
            debug("Random pub : %d" , result.pid);
            res.redirect('/pub/' + result.pid);
        })

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