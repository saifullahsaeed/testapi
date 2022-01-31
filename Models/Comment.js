class Comment {
    constructor(comment, user_id, post_id) {
        if (!comment || !post_id) {
            throw new Error('Comment and post_id are required');
        }
        this.comment = comment;
        this.user_id = user_id;
        this.post_id = post_id;
    }
}

module.exports = Comment;