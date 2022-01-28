//add boilerplate code fo router
const express = require('express');
const router = express.Router();
//import all functions from db/Oprations.js
const {
    insertUser,
    login,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../db/Oprations');
//import User model
const { User } = require('../Models/User');


//update user route
router.post('/update', async (req, res) => {
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
        }).catch(err => { })

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
router.get('/:id', (req, res) => {
    getUser(req.params.id)
        .then(user => {
            return res.status(200).json({ user });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});
//Delete user route
router.delete('/:id', (req, res) => {
    deleteUser(req.params.id)
        .then(user => {
            return res.status(200).json({ user });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

module.exports = router;