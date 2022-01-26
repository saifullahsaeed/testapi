const sqlite3 = require('sqlite3').verbose();
//import env
const env = require('dotenv').config();

//env variable for db path
const dbPath = process.env.DATABASE_PATH || 'database.sqlite';

//opening db
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the database.');
});

//creating table
let createTables = db.serialize(() => {
    user = db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL,created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
    if (user) {
        console.log('Table created Users');
    }
    post = db.run('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, user_id INTEGER NOT NULL, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
    if (post) {
        console.log('Table created Posts');
    }
    blocked = db.run('CREATE TABLE IF NOT EXISTS blocked (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
    if (blocked) {
        console.log('Table created Blocked');
    }
    comment = db.run('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, body TEXT NOT NULL, user_id INTEGER NOT NULL, post_id INTEGER NOT NULL, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
    if (comment) {
        console.log('Table created Comments');
    }
});
if (createTables) {
    console.log('Migration complete');
}