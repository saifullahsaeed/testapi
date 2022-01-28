const jwt = require('jsonwebtoken');
const env = require('dotenv').config();


//genrate 64 char hex random string for JWT
const hexgen = function getRandomString(length) {
    var randomChars = "abcdef0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length)
        );
    }
    return result;
};

hexgen(64);
console.log(hexgen(64));