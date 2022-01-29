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
    isValidPassword = async function(password) {
        const user = this;
        const compare = await crypto.compare(password, user.password);
        return compare;
    }
}

module.exports = { User, Login };