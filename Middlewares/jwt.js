const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const env = require('dotenv').config();


class Jwt {
    constructor() {
        this.secret = process.env['JWT_SECRET'];
    }

    signToken(payload) {
        //base64 encoded secret
        console.log(this.secret);
        return jwt.sign(payload, this.secret, {
            expiresIn: '1h',
            algorithm: 'HS512'
        });

    }

    verify(token) {
        //base64 encoded secret
        //convert to string
        return jwt.verify(token, this.secret + '');
    }
}

module.exports = new Jwt();