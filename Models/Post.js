class Post {
    constructor(title, body, user_id) {
            if (!title || !body || !user_id) {
                new Error('All fields are required');
            }
            this.title = title;
            this.body = body;
            this.user_id = user_id;
        }
        //json method
    toJSON() {
        return {
            title: this.title,
            content: this.content,
        };
    }
    fromJSON(json) {
        this.title = json.title;
        this.content = json.content;
        this.author = json.author;
    }
}

module.exports = Post;