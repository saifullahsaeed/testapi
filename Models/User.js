class User {
    constructor(name, email, password) {
        //validate all fields
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }
        this.name = name;
        this.email = email;
        this.password = password;
    }

}

module.exports = User;