"use strict";

var debug = require("debug")("beershots:routes");

var routes = require("./index");
var authroutes = require("./authroutes.js");

var SetupRoutes = function () {
};

SetupRoutes.setup = function (self) {

    // Setup the google routes
    authroutes.setup(self);

    // Check for the login route first - this can be accessed unauthenticated
    self.app.get("/login", function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            res.render("login", { layout: "main-login" });
        }

    });

    // Everything should be authenticated
    self.app.use(function (req, res, next) {
        if (req.isUnauthenticated()) {
            debug("Unauthenticated request caught : %s", req.path);
            if (req.path.startsWith("/api/")) {
                res.sendStatus(401);
                return;
            }

            req.session.redirect_to = req.url;
            res.redirect("/login");
        } else {
            debug("authenticated request : %s", req.path);
            next("route");
        }
    });

    // All of these routes should be authenticated
    self.app.use("/", routes);

};

module.exports = SetupRoutes;