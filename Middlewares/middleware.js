const { checkIfPostIsMadeByUser } = require('../db/Oprations');

class AuthMidleware {
    //check if user is admin
    isAdmin(req, res, next) {

        if (req.user.type == 'admin') {
            console.log('is admin');
            return next();
        } else {
            return res.status(401).json({ error: 'Low Privlge' });
        }
    }
    postOwnership(req, res, next) {
        try {
            let post = req.params.id;
            checkIfPostIsMadeByUser(req.user.id, post).then(result => {
                if (result) {
                    next();
                } else {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            }).catch(err => {
                return res.status(401).json({ error: 'Unauthorized' });
            });
        } catch (err) {
            return res.status(401).json({ error: err });
        }
    }


}

module.exports = new AuthMidleware();