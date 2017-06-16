'use strict';

var debug = require('debug')('beershots:api-routes');
var pubs = require('../dao/pubs.js');

var ApiRoutes = function () {
};

ApiRoutes.createRoutes = function (self) {

    self.app.get('/api/searchbylocation', function (req, res, next) {

        pubs.getAll(function (result) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        });
    });
}



module.exports = ApiRoutes;