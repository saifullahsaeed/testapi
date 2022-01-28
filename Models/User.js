const crypto = require('crypto');
class User {
    constructor(name = '', email, password) {
            //validate all fields
            if (!email || !password) {
                throw new Error('All fields are required');
            }
            this.name = name;
            this.email = email;
            this.password = password;
        }
        //hash password
    encryptPassword = function() {

        // Creating a unique salt for a particular user 
        this.salt = crypto.randomBytes(16).toString('hex');

        // Hashing user's salt and password with 1000 iterations, 

        this.password = crypto.pbkdf2Sync(this.password, this.salt,
            1000, 64, `sha512`).toString(`hex`);
    };



}
class Login {
    constructor(email, password) {
        if (!email || !password) {
            throw new Error('All fields are required');
        }
        this.email = email;
        this.password = password;
    }
    encryptPassword = function() {

        // Creating a unique salt for a particular user 
        this.salt = crypto.randomBytes(16).toString('hex');

        // Hashing user's salt and password with 1000 iterations, 

        this.password = crypto.pbkdf2Sync(this.password, this.salt,
            1000, 64, `sha512`).toString(`hex`);
    };
    // Method to check the entered password is correct or not 
    validPassword = function(password, hashs) {
        var hash = crypto.pbkdf2Sync(password,
            this.salt, 1000, 64, `sha512`).toString(`hex`);
        return hashs === hash;
    };
}

module.exports = { User, Login };