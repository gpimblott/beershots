const dbhelper = require('../utils/dbhelper.js');
const debug = require('debug')('beershots:user');

const User = function () {
    this.id = 0;
    this.firstname = '';
    this.surname = '';
    this.googleid = '';
    this.fullname = '';
    this.email = '';
    this.picture = '';
    this.gender = '';
    this.googletoken = '';
};

User.findOne = function (profile, done) {

    debug("findOne : %s", profile.id);
    const sql = "SELECT *  FROM users where googleid=$1 ";

    dbhelper.query(sql, [ profile.id ],
        (results) => {

            if (results === null || results.length === 0) {
                return done(null, null);
            }

            const user = User.recordToUser(results[ 0 ]);
            return done(null, user);
        },
        (error) => {
            debug(error);
            return done(null, null);
        });
};

User.findById = function (id, done) {
    debug("findById : %s", id);

    const sql = "SELECT * FROM users where id=$1 ";

    dbhelper.query(sql, [ id ],
        (results) => {

            if (results === null) {
                return done(null, null);
            }

            if (results.length === 0) {
                debug("User %s NOT found", id);
                return done(null, null);
            } 
                debug("User %s found", id);
                const user = User.recordToUser(results[ 0 ]);
                return done(null, user);
            
        },
        (error) => {
            debug("Error finding user %s : %s", id, error);
            return done(null, null);
        });
};

User.prototype.save = function (done) {

    const sql = "INSERT INTO users ( firstname, surname, googleid, fullname, email,picture,gender,googletoken) " +
        "values ( $1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 ) returning id";
    const params = [ this.firstname, this.surname, this.googleid, this.fullname, this.email, this.picture, this.gender, this.googletoken ];

    dbhelper.insert(sql, params,
        (result) => done(result.rows[ 0 ].id),
        (error) => {
            debug(error);
            return done(null);
        });
}

User.updateAccessToken = function (userid, token, done) {
    const sql = "UPDATE users set googletoken = $2 WHERE id=$1";
    const params = [ userid, token ];

    dbhelper.query(sql, params,
        (results) => {
            done(results);
        },
        (error) => {
            debug(error);
            return done(null);
        });
}

User.recordToUser = function (record) {
    const user = new User();
    user.id = record.id;
    user.firstname = record.firstname;
    user.surname = record.surname;
    user.googleid = record.googleid;
    user.fullname = record.fullname;
    user.email = record.email;
    user.picture = record.picture;
    user.gender = record.gender;
    user.googletoken = record.googletoken;

    return user;
}

module.exports = User;