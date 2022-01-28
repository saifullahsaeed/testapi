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
    let user
    try {
        user = new User(req.body);
        insertUser(user)
            .then(() => {
                res.json({ message: 'User added' });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    //insert user


});

module.exports = router;