//express router
const router = require('express').Router();
const { getAllPosts, insertPost, updatePost, deletePost, findPost, findPostBySearchQuery } = require('../db/Oprations');
const Post = require('../models/Post');
const AuthMidleware = require('../Middlewares/middleware');
const passport = require('passport');

router.get('/', (req, res) => {
    //get all the posts
    getAllPosts().then((posts) => {
        return res.status(200).json(posts);
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});

//insert post
router.post('/', passport.authenticate('bearer', { session: false }), (req, res) => {
    try {
        var postObj = new Post(req.body.title, req.body.body, req.user.id);
        //insert post
        insertPost(postObj).then((post) => {
            return res.status(200).json({ 'message': 'Post added' });
        }).catch(err => {
            return res.status(500).json({ error: err });
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }


});
//update post
router.put('/:id', passport.authenticate('bearer', { session: false }), AuthMidleware.postOwnership, (req, res) => {
    try {
        var postObj = new Post(req.body.title, req.body.body, req.user.id);
        postObj.id = req.params.id;
        //update post
        updatePost(postObj).then((post) => {
            return res.status(200).json({ 'message': 'Post updated' });
        }).catch(err => {
            return res.status(500).json({ error: err });
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
//delete post
router.delete('/:id', passport.authenticate('bearer', { session: false }), AuthMidleware.postOwnership, (req, res) => {
    //delete post
    deletePost(req.params.id).then((post) => {
        return res.status(200).json({ 'message': 'Post deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});
//find post
router.get('/:id', (req, res) => {
    //find post
    findPost(req.params.id).then((post) => {
        return res.status(200).json(post);
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});
//find post by search query
router.get('/search/:query', (req, res) => {
    //find post
    findPostBySearchQuery(req.params.query).then((posts) => {
        return res.status(200).json(posts);
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});



module.exports = router;