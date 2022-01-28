const jwt = require('jsonwebtoken');

class Jwt {
    constructor() {
        this.secret = process.env.JWT_SECRET;
    }

    sign(payload) {
        console.log(this.secret);
        return jwt.sign(payload, this.secret, { expiresIn: '1h' });
    }

    verify(token) {
        return jwt.verify(token, this.secret);
    }
}

module.exports = new Jwt();