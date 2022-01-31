//boilerplate for express router
// Language: javascript
const router = require('express').Router();
const { getStatistics, deleteUser, deletePost, deleteComment } = require('../db/Oprations');

//delete all users
router.delete('/deleteallusers', (req, res) => {
    //delete all users
    deleteAllUsers().then((users) => {
        return res.status(200).json({ 'message': 'All users deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});

//get statistics
router.get('/statistics', (req, res) => {
    //get statistics
    getStatistics().then((statistics) => {
        return res.status(200).json(statistics);
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});
//delete a user
router.delete('/deleteuser/:id', (req, res) => {
    //delete a user
    deleteUser(req.params.id).then((user) => {
        return res.status(200).json({ 'message': 'User deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});
//delete a post
router.delete('/deletepost/:id', (req, res) => {
    //delete a post
    deletePost(req.params.id).then((post) => {
        return res.status(200).json({ 'message': 'Post deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});
//delete a comment
router.delete('/deletecomment/:id', (req, res) => {
    //delete a comment
    deleteComment(req.params.id).then((comment) => {
        return res.status(200).json({ 'message': 'Comment deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});


module.exports = router;