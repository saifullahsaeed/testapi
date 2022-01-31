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
            //check if user is blocked

            user.then(user => {
                user.password = undefined;
                if (user.blocked) {
                    return done(null, false);
                }
                return done(null, user);
            }).catch(err => {
                return done(null, false);
            });
        }
    ));
}