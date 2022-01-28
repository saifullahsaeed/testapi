//import sqlite3 
const sqlite3 = require('sqlite3').verbose();
const env = require('dotenv').config();


//use db path from env
const dbPath = process.env.DATABASE_PATH;

//open db
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the database.');
});

//insert User function takes User model as parameter
const insertUser = (User) => {
    return new Promise((resolve, reject) => {
        //email must be unique
        db.get(`
            SELECT * FROM users WHERE email = ?
        `, [User.email], (err, row) => {
            if (err) {
                reject(err);
            }
            if (row) {
                reject(new Error('Email already exists'));
            } else {

                db.run(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `, [User.name, User.email, User.password], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    db.get(`SELECT id FROM users WHERE email = ?`, [User.email], (err, row) => {
                        resolve(row);
                    });
                });
            }
        });
    });
};

//login function takes User model as parameter
const login = (Login) => {
    //check for user in db
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM users WHERE email = ?
        `, [Login.email], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (row) {
                //compare password
                if (Login.password === row.password) {
                    resolve(row);
                } else {
                    reject(new Error('Invalid Password'));
                }
            } else {
                reject(new Error('User not found'));
            }
        });
    });
}
//UPDATE user function takes User model as parameter
const updateUser = (User) => {
    return new Promise((resolve, reject) => {
        db.run(`

            UPDATE users
            SET name = ?, email = ?, password = ?
            WHERE id = ?
        `, [User.name, User.email, User.password, User.id], (err) => {
            if (err) {
                return reject(err);
            }
            resolve(User);
        });
    });
}

//delete user function takes id as parameter
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM users
            WHERE id = ?
        `, [id], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes);
        });
    });
}

//find user function takes id as parameter
const findUser = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`

            SELECT * FROM users
            WHERE id = ?
        `, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

//get all users function
const getAllUsers = () => {
    //skip password column from query
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT id,name,email FROM users
        `, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


module.exports = { insertUser, login, deleteUser, findUser, getAllUsers, updateUser };