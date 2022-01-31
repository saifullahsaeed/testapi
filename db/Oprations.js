//import sqlite3 
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


//use db path from env
const dbPath = process.env.DATABASE_PATH || './db/database.db';

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
        `, [User.username], (err, row) => {
            if (err) {
                reject(err);
            }
            if (row) {
                reject(new Error('Email already exists'));
            } else {

                db.run(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `, [User.name, User.username, User.password], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    db.get(`SELECT id FROM users WHERE email = ?`, [User.username], (err, row) => {
                        resolve(row);
                    });
                });
            }
        });
    });
};

//login function takes User model as parameter
const login = (Login) => {
    //check if credentials are valid
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM users WHERE email = ?
        `, [Login.username], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return reject(null, false, { message: 'Incorrect username.' });
            }
            if (Login.password !== row.password) {
                return reject(null, false, { message: 'Incorrect password.' });
            }
            return resolve(row);
        });
    });
};
//delete all users function
const deleteAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM users`, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
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
    //find post function takes id as parameter with comments
const findPost = (id) => {

        return new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM posts
                WHERE id = ?
            `, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return reject(new Error('Post not found'));
                }
                db.all(`
                    SELECT * FROM comments
                    WHERE post_id = ?
                `, [id], (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        post: row,
                        comments: rows
                    });
                });
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

//check if post is by made by user function takes user_id and post_id as parameter
const checkIfPostIsMadeByUser = (user_id, post_id) => {
        return new Promise((resolve, reject) => {
            db.get(`
            SELECT * FROM posts
            WHERE id = ? AND user_id = ?
        `, [post_id, user_id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }
    //comment function takes Comment model as parameter
const insertComment = (Comment) => {
        return new Promise((resolve, reject) => {
            db.run(`

            INSERT INTO comments (body, post_id, user_id)
            VALUES (?, ?, ?)
        `, [Comment.comment, Comment.post_id, Comment.user_id], function(err) {
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
    //get statistics function which shows total number of users,posts and comments respectively
const getStatistics = () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT COUNT(*) AS users, COUNT(*) AS posts, COUNT(*) AS comments
            FROM users
            JOIN posts
            JOIN comments
        `, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}




module.exports = { insertUser, login, deleteUser, deleteAllUsers, findUser, getAllUsers, updateUser, checkIfPostIsMadeByUser, insertPost, updatePost, deletePost, findPost, findPostBySearchQuery, getAllPosts, insertComment, deleteComment, getStatistics };