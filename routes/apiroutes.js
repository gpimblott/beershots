'use strict';

const debug = require('debug')('beershots:api-routes');
const pubs = require('../dao/pubs.js');
const pubRatings = require('../dao/pubRatings.js');
const sanitizer = require('sanitize-html');

const ApiRoutes = function () {
};

ApiRoutes.createRoutes = function (self) {

    self.app.get('/api/searchbylocation', (req, res, next) => {

        pubs.getAll((result) => {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(result));
        });
    });

    self.app.put('/api/rating', (req, res, next) => {
        const rating = sanitizer(req.body.rating);
        const pid = sanitizer(req.body.pid);

        debug("User %d : rating pub %d - %d stars", req.user.id , pid, rating);
        pubRatings.add(req.user.id, pid, rating, (result) => {
            const payload = {};
            payload.success = true;

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(payload));
            return;
        });


    });
}


module.exports = ApiRoutes;