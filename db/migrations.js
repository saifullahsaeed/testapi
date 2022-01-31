const sqlite3 = require('sqlite3').verbose();
//import env
const env = require('dotenv').config();

//env variable for db path
const dbPath = process.env.DATABASE_PATH;
if (!dbPath) {
    console.error('DATABASE_PATH environment variable not set');
    process.exit(1);
}
//db connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

try {
    //creating table
    let createTables = db.serialize(() => {
        user = db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL,type text default user, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
        if (user) {
            console.log('Table created Users');
        }
        post = db.run('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, user_id INTEGER NOT NULL, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
        if (post) {
            console.log('Table created Posts');
        }
        blocked = db.run('CREATE TABLE IF NOT EXISTS blocked (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT default CURRENT_TIMESTAMP, updated_at TEXT default CURRENT_TIMESTAMP)');
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
} catch (err) {
    console.log(err);
}