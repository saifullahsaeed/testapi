const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const env = require('dotenv').config();


class Jwt {
    constructor() {
        this.secret = process.env['JWT_SECRET'];
    }

    signToken(payload) {
        const token = jwt.sign(payload,
            this.secret, {
                expiresIn: '1h',
                algorithm: 'HS256'
            },
            function(err, token) {
                if (err) {
                    console.log(err);
                    return err;
                } else {
                    console.log(token);
                    return token;
                }
            });

    }

    verify(token) {
        console.log(process.env['JWT_SECRET']);
        return jwt.verify(token, this.secret, {
            algorithm: 'HMACSHA256',
            complete: true
        });
    }
}

module.exports = new Jwt();