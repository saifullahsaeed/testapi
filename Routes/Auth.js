//add express router
const express = require('express');
const router = express.Router();
//import oprations
const { insertUser, login } = require('../db/Oprations');
//import User model
const { User, Login } = require('../Models/User');
//import jwt
const jwt = require('../Middlewares/jwt');

//create register route
router.post('/registers', (req, res) => {
    //create user model 
    try {
        let Userobj = new User(req.body.name, req.body.email, req.body.password);
        Userobj.encryptPassword();
        insertUser(Userobj)
            .then((user) => {
                //send jwt token
                return res.status(200).json({ token: jwt.sign({ id: user.id, password: user.password }) });

            })
            .catch(err => {
                return res.status(500).json({ error: err.message });
            });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }



});
//login route
router.post('/login', async(req, res) => {
    //create user model 
    try {
        let Userobj = new Login(req.body.email, req.body.password);
        Userobj.encryptPassword();
        await login(Userobj).then(user => {
            if (user) {
                console.log(user);

                return res.status(200).json({ token: jwt.sign({ id: user.id, email: user.email, password: user.password }) });
            } else {
                console.log(user);

                return res.status(400).json({ error: 'Invalid Email or Password' });
            }
        }).catch(err => {})

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
//logout route
router.post('/logout', (req, res) => {
    //expires token
    return res.status(200).json({ message: 'Logged out' });
});
module.exports = router;