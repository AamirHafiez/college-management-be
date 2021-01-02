const User = require('../../../models/user');

module.exports.getUserDetails = (req, res) => {
    return res.json({
        'message': 'user data',
        'data': req.user
    });
}