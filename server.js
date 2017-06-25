'use strict';

require('dotenv').config({ path: 'process.env' });

const passport = require('passport');
require('./config/passport');

const debug = require('debug')('beershots:server');
const http = require('http');

const express = require('express');
require('handlebars');
const exphbs = require('express-handlebars');
const hdf = require('handlebars-dateformat');
require('./utils/handlerbarsHelpers');

const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const session = require('express-session');
//var express_enforces_ssl = require('express-enforces-ssl');

const setupRoutes = require('./routes/setupRoutes');

const helmet = require('helmet');

/**
 * Set API Key based on Environment variable
 **/
const BeerShotApp = function () {
    const self = this;

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8090;
        self.ip_address = process.env.OPENSHIFT_NODEJS_IP;

    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === 'string') {
            debug('%s: Received %s - terminating Application ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        debug('%s: Node server stopped.', Date(Date.now()));
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', () => {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        [ 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach((element, index, array) => {
            process.on(element, () => {
                self.terminator(element);
            });
        });
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Setup Express
        self.app = express();
        self.app.use(morgan('tiny'));
        self.app.use(helmet());

        self.app.engine('hbs',
            exphbs({
                helpers: {
                    dateFormat: hdf
                },
                defaultLayout: 'main',
                extname: '.hbs'
            }));

        self.app.set('view engine', 'hbs');

        // Lets encrypt response
        const letsEncryptUrl = process.env.LETS_ENCRYPT;
        const letsEncryptResponse = process.env.LETS_ENCRYPT_RESPONSE;

        if( letsEncryptResponse != undefined && letsEncryptResponse != undefined) {
            self.app.get('/.well-known/acme-challenge/' + letsEncryptUrl, (req, res) => {
                res.send(letsEncryptResponse);
                res.end();
            });
        }
        // Setup the Google Analytics ID if defined
        self.app.locals.locationiq_key = process.env.LOCATIONIQ_KEY || undefined;
        debug("LocationIQ Key: %s", self.app.locals.locationiq_key);

        // Setup the Google Analytics ID if defined
        self.app.locals.google_id = process.env.GOOGLE_ID || undefined;
        debug('GA ID: %s', self.app.locals.google_id);

        const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        const sess = {
            secret: cookie_key,
            cookie: {}
        }

        if (self.app.get('env') === 'production') {
            self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
            debug('In production mode');
            sess.cookie.secure = true;
        }

        // Deal with static files first
        self.app.use(express.static(path.join(__dirname, 'public')));

        // Now deal with sessions and passport files
        self.app.use(session(sess));
        self.app.use(passport.initialize());
        self.app.use(passport.session());


        // view engine setup
        self.app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
        self.app.set('partialsDir', path.join(__dirname, 'views/partials'));
        self.app.set('views', path.join(__dirname, 'views'));


        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({
            extended: false
        }));
        self.app.use(cookieParser());

        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
            debug('In development mode');
            self.app.use((err, req, res, next) => {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // Add stuff to each request here
        self.app.use((req, res, next) => {
            if (req.user) {
                res.locals.profile = req.user;
            }

            next();
        });


        // Setup the Server-side events
        setupRoutes.setup( self );

        self.app.use((req, res, next) => {
            // the status option, or res.statusCode = 404
            // are equivalent, however with the option we
            // get the 'status' local available as well
            res.render('404', { status: 404, url: req.url });
        });

    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ip_address, () => {
            debug('%s: Server started on %s:%d ...',
                Date(Date.now()), self.ip_address, self.port);
        });
    };
}

/**
 *  main():  Main code.
 */
const exampleNodeApp = new BeerShotApp();
exampleNodeApp.initialize();
exampleNodeApp.start();
