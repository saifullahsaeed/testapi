const BearerStrategy = require('passport-http-bearer');
const jwt = require('../Middlewares/jwt');
const { findUser } = require('../db/Oprations');

function findOne({ token }) {
    let decoded = jwt.verify(token);
    return findUser(decoded.id);
}

module.exports = function(passport) {

    passport.use(new BearerStrategy(
        function(token, done) {
            console.log(token);
            findOne({ token: token }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }

                return done(null, user, { scope: 'all' });
            });
        }
    ));
}