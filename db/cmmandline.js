const sqlite3 = require('sqlite3').verbose();

//env variable for db path
const dbPath = process.env['DATABASE_PATH'] || './db/database.db';
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
//make a user admin
const makeAdmin = (userId) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET type = 'admin' WHERE id = ${userId}`, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

//run make admin function from command line args
makeAdmin(process.argv[2]).then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});