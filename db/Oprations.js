//import sqlite3 
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//use db path from env
const dbPath = process.env.DATABASE_PATH + process.env.DATABASE_NAME + '.db';

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
        `, [User.name, User.email, User.password], function(err) {
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
    //use passport local strategy
    return new Promise((resolve, reject) => {
        passport.use(new LocalStrategy(
            function(username, password, done) {
                db.get(`
                    SELECT * FROM users WHERE email = ?
                `, [username], (err, row) => {
                    if (err) {
                        return done(err);
                    }
                    if (!row) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (row.password !== password) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, row);
                });
            }
        ));
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                return reject(info);
            }
            return resolve(user);
        })({ body: Login });
    });
};

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
        `, [id], function(err) {
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
    //insert post function takes Post model as parameter
const insertPost = (Post) => {
        return new Promise((resolve, reject) => {
            db.run(`

            INSERT INTO posts (title, body, user_id)
            VALUES (?, ?, ?)
        `, [Post.title, Post.body, Post.user_id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    }
    //update post function takes Post model as parameter
const updatePost = (Post) => {
        return new Promise((resolve, reject) => {
            db.run(`

            UPDATE posts
            SET title = ?, body = ?, user_id = ?
            WHERE id = ?
        `, [Post.title, Post.body, Post.user_id, Post.id], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(Post);
            });
        });
    }
    //delete post function takes id as parameter
const deletePost = (id) => {
        return new Promise((resolve, reject) => {
            db.run(`

            DELETE FROM posts
            WHERE id = ?
        `, [id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    }
    //find post function takes id as parameter
const findPost = (id) => {
        return new Promise((resolve, reject) => {
            db.get(`

            SELECT * FROM posts
            WHERE id = ?
        `, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }
    //find post by matching title  or body function takes search as parameter
const findPostBySearchQuery = (search) => {
    return new Promise((resolve, reject) => {
        db.all(`

            SELECT * FROM posts
            WHERE title LIKE ? OR body LIKE ?
        `, [`%${search}%`, `%${search}%`], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

//get all posts function
const getAllPosts = () => {
        //skip password column from query
        return new Promise((resolve, reject) => {
            db.all(`
            SELECT id,title,body,user_id FROM posts
        `, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
    //comment function takes Comment model as parameter
const insertComment = (Comment) => {
        return new Promise((resolve, reject) => {
            db.run(`

            INSERT INTO comments (body, post_id, user_id)
            VALUES (?, ?, ?)
        `, [Comment.body, Comment.post_id, Comment.user_id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    }
    //delete comment function takes id as parameter
const deleteComment = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`

            DELETE FROM comments
            WHERE id = ?
        `, [id], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes);
        });
    });
}



module.exports = { insertUser, login, deleteUser, findUser, getAllUsers, updateUser };