const BearerStrategy = require('passport-http-bearer');
const jwt = require('../Middlewares/jwt');
const { findUser } = require('../db/Oprations');

async function findOne({ token }) {
    let decoded = jwt.verify(token);
    return findUser(decoded.id);
}

module.exports = function(passport) {

    passport.use(new BearerStrategy(
        function(token, done) {
            console.log(token);
            let user = findOne({ token: token });
            user.then(user => {
                user.password = undefined;
                return done(null, user);
            }).catch(err => {
                return done(null, false);
            });
        }
    ));
}