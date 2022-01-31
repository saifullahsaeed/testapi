const crypto = require('crypto');
class User {
    constructor(name = '', username = '', password = '') {
            //validate all fields
            if (!username || !password) {
                throw new Error('All fields are required');
            }
            this.name = name;
            this.username = username;
            this.password = password;
        }
        //hash password
    encryptPassword = function() {
        this.salt = process.env['SALT'];
        this.password = crypto.pbkdf2Sync(this.password, this.salt,
            1000, 64, `sha512`).toString(`hex`);
    };
}
class Login {
    constructor(username, password) {
        if (!username || !password) {
            throw new Error('All fields are required');
        }
        this.username = username;
        this.password = password;
    }
    encryptPassword = function() {

        // Creating a unique salt for a particular user 
        this.salt = process.env['SALT'];

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