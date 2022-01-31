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

//make a seed function
const seed = () => {
    //insert user
    insertUser({
        name: 'John Doe',
        email: 'johm@abc.com',
        password: '123456'
    }).then((user) => {
        console.log(user);
    }).catch((err) => {
        console.log(err);
    });
    //insert post
    insertPost({
        title: 'My first post',
        body: 'This is my first post',
        user_id: 1
    }).then((post) => {
        console.log(post);
    }).catch((err) => {
        console.log(err);
    });
    //insert comment
    insertComment({
        body: 'This is my first comment',
        user_id: 1,
        post_id: 1
    }).then((comment) => {
        console.log(comment);
    }).catch((err) => {
        console.log(err);
    });
    //insert blocked
    insertBlocked({
        user_id: 1,
        blocked_id: 2
    }).then((blocked) => {
        console.log(blocked);
    }).catch((err) => {
        console.log(err);
    });
};

//bulk insert posts
const bulkInsertPosts = () => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        for (let i = 0; i < 100; i++) {
            db.run('INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)', ['Post ' + i, 'Body ' + i, 1]);
        }
        db.run('COMMIT');
    });
};

bulkInsertPosts();
//do 2 or 3 commants on eatch post
const bulkInsertComments = () => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.each('SELECT * FROM posts', (err, post) => {
            for (let i = 0; i < 2; i++) {
                db.run('INSERT INTO comments (body, user_id, post_id) VALUES (?, ?, ?)', ['Comment ' + i, 1, post.id]);
            }
        });
        db.run('COMMIT');
    });
};

bulkInsertComments();