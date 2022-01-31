//boilerplate for express router
// Language: javascript
const passport = require('passport');
const { deleteComment, insertComment } = require('../db/Oprations');
const Comment = require('../Models/Comment');


const router = require('express').Router();

//add a comment
router.post('/', passport.authenticate('bearer', { session: false }), (req, res) => {
    try {
        var commentObj = new Comment(req.body.comment, req.user.id, req.body.post_id);
        insertComment(commentObj).then((comment) => {
            return res.status(200).json({ 'message': 'Comment added' });
        }).catch(err => {
            return res.status(500).json({ error: err });
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

//delete comment
router.delete('/:id', passport.authenticate('bearer', { session: false }), (req, res) => {
    //delete comment
    deleteComment(req.params.id).then((comment) => {
        return res.status(200).json({ 'message': 'Comment deleted' });
    }).catch(err => {
        return res.status(500).json({ error: err });
    });
});

module.exports = router;