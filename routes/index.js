const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const url = req.session.redirect_to;
    if (url !== undefined) {
        delete req.session.redirect_to;
        res.redirect(url);
    }
    else {
        res.render("index", { layout: 'main' });
    }
});


router.get('/map', (req, res,next) => {
    res.render("map", { layout: 'main-map' });
});

module.exports = router;
