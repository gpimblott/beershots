'use strict';

const passport = require('passport');

const AuthRoutes = function () {
};

/*****************************************************
 * Authentication Interfaces
 ******************************************************/
AuthRoutes.setup = function (self) {

    self.app.get('/auth/google', passport.authenticate('google',
        {
            scope: ['https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'],
            accessType: 'online',
            approvalPrompt: 'auto'
        }));

    self.app.get('/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/pages/index'}),
        (req, res) => {
            res.redirect('/');
        });

    self.app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });

};

module.exports = AuthRoutes;

