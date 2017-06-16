var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var url = req.session.redirect_to;
    if (url != undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    }
    else {
        res.render("index", { layout: 'main' });
    }

});


router.get('/map', function (req, res,next) {

    res.render("map", { layout: 'main-map' });

});

module.exports = router;
