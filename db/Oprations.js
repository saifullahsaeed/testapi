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
        db.run(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `, [User.name, User.email, User.password], function(err) {
            if (err) {
                return reject(err);
            }
            res.json({ message: 'User added' });
            db.get(`SELECT id FROM users WHERE email = ?`, [User.email], (err, row) => {
                resolve(row);
            });
        });
    });
};

//login function takes User model as parameter
const login = (User) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM users
            WHERE email = ?
            AND password = ?
        `, [User.email, User.password], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

module.exports = { insertUser, login };