"use strict";

const debug = require("debug")("beershots:routes");

const routes = require("./index");
const authroutes = require("./authroutes.js");
const apiroutes = require("./apiroutes.js");
const pubroutes = require("./pubroutes.js");

const SetupRoutes = function () {
};

SetupRoutes.setup = function (self) {

    // Setup the google routes
    authroutes.setup(self);

    // Check for the login route first - this can be accessed unauthenticated
    self.app.get("/login", (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            res.render("landing-page", { layout: "landing-page" });
        }

    });

    // Everything should be authenticated
    self.app.use((req, res, next) => {

        if (req.isUnauthenticated()) {
            debug("Unauthenticated request caught : %s", req.path);
            if (req.path.startsWith("/api/")) {
                res.sendStatus(401);
                return;
            }

            req.session.redirect_to = req.url;
            res.redirect("/login");
        } else {
            next("route");
        }
    });

    // All of these routes should be authenticated
    self.app.use("/", routes);

    apiroutes.createRoutes( self );
    pubroutes.createRoutes( self );

};

module.exports = SetupRoutes;