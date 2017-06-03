var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

    res.render("index", { layout: 'main' });

});

router.get('/test', function (req, res, next) {

    res.render("landing-page", { layout: 'landing-page' });

});

module.exports = router;
