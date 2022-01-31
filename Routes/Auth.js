//add express router
const express = require('express');
const router = express.Router();
const passport = require('passport');
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
                return res.status(200).json({ 'message': 'User Registerd Login now' });

            })
            .catch(err => {
                return res.status(500).json({ error: err.message });
            });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }



});
//login route
router.post('/login', function(req, res) {
    try {
        let Loginobj = new Login(req.body.username, req.body.password);
        Loginobj.encryptPassword();
        login(Loginobj).then((user) => {
            //send jwt token
            passport.authenticate(
                'bearer', {
                    session: false
                },
            )
            const token = jwt.signToken({ id: user.id, email: user.email, name: user.name });
            return res.status(200).json({ 'token': token, 'assigned_at': Date.now(), 'expires_in': 3600 });

        }).catch(err => {
            return res.status(500).json({ error: err });
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

});
//logout route
router.post('/logout', passport.authenticate('bearer', { session: false }), (req, res) => {

    return res.status(200).json({ message: 'Logged out' });
});
module.exports = router;