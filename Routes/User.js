//add boilerplate code fo router
const express = require('express');
const router = express.Router();
const authenticated = require('../Middlewares/middleware');
//import all functions from db/Oprations.js
const {
    findUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../db/Oprations');
//import User model
const { User } = require('../Models/User');
const passport = require('passport');




//update user route
router.post('/update', passport.authenticate('bearer', { session: false }), async(req, res) => {
    //create user model
    try {
        let Userobj = new User(req.body.name, req.body.email, req.body.password);
        Userobj.encryptPassword();
        await updateUser(Userobj).then(user => {
            if (user) {
                return res.status(200).json({ message: 'User updated successfully' });
            } else {
                return res.status(400).json({ error: 'User not found' });
            }
        }).catch(err => {})

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

//get all users route
router.get('/', (req, res) => {
    getAllUsers()
        .then(users => {
            return res.status(200).json({ users });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});
//get user route
router.get('/find/:id', (req, res) => {
    (req.params.id)
    findUser.then(user => {
            //trim the password
            user.password = undefined;

            return res.status(200).json({ user });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

//delete me
router.delete('/me', passport.authenticate('bearer', { session: false }), (req, res) => {
    console.log(req.user);
    deleteUser(req.user.id)
        .then(user => {
            return res.status(200).json({ message: 'User deleted successfully' });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});
//get me
router.get('/me', passport.authenticate('bearer', { session: false }), (req, res) => {
    //trim the password
    return res.status(200).json({ user: req.user });
});
module.exports = router;