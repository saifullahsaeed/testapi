//authenticated check
const { User, Login } = require('../models/user');
const jwt = require('../Middlewares/jwt');
const { insertUser, login } = require('../db/Oprations');

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
}