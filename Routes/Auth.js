//add express router
const express = require('express');
const router = express.Router();
//import oprations
const { insertUser, login } = require('../db/Oprations');
//import User model
const User = require('../Models/User');

//create register route
router.post('/register', (req, res) => {
    //create user model
    const user = new User(req.body);
    //insert user
    insertUser(user)
        .then(() => {
            res.json({ message: 'User added' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });

});

module.exports = router;