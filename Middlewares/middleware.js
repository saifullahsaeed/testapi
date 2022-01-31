//authenticated check
const { User } = require('../models/user');
const jwt = require('../Middlewares/jwt');

class AuthMidleware {
    //token check
    async tokenCheck(req, res, next) {
            try {
                let token = req.headers.authorization.split(' ')[1];
                let decoded = jwt.verify(token);
                let user = await User.findOne({ where: { id: decoded.id } });
                if (user) {
                    req.user = user;
                    next();
                } else {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            } catch (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
        //check if user owns the profile
    async userOwnsProfile(req, res, next) {

            try {
                let user = await User.findOne({ where: { id: req.params.id } });
                if (user.id == req.user.id) {
                    next();
                } else {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            } catch (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
        //check if user is admin
    async isAdmin(req, res, next) {

            try {
                let user = await User.findOne({ where: { id: req.user.id } });
                if (user.isAdmin) {
                    next();
                } else {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            } catch (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
        //varify token
    async verifyToken(req, res, next) {
        try {
            let token = req.headers.authorization.split(' ')[1];
            let decoded = jwt.verify(token);
            let user = await User.findOne({ where: { id: decoded.id } });
            if (user) {
                req.user = user;
                next();
            } else {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    postOwnership(req, res, next) {
        try {
            let post = req.params.id;
            if (post == req.user.id) {
                next();
            } else {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

}

module.exports = new AuthMidleware();