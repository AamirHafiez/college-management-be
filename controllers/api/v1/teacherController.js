const User = require('../../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.createTeacher = async (req, res) => {
    try {
        let teacher = await User.findOne({email: req.body.email})
        if(teacher) {
            return res.json({
                'message': 'user already exists',
            });
        }
        if(req.body.subject === ''){
            throw "techer subject not valid"
        }
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        req.body['userType'] = 'teacher';
        await User.create(req.body);
        return res.json(200, {
            'message': 'success'
        });
    } catch (error) {
        return res.status(500).json({
            'message': 'internal server error',
            'error': error
        });
    }
}

module.exports.teacherLogin = async (req, res) => {
    try {
        let teacher = await User.findOne({email: req.body.email});
        if(!teacher || teacher.userType === 'student'){
            res.json({
                'message': 'teacher not found'
            });
            return;
        }
        
        let checkPassword = await bcrypt.compare(req.body.password, teacher.password);
        if(!checkPassword){
            res.json({
                'message': 'email/password invalid'
            });
            return;
        }
        return res.json({
            'message' : 'teacher authenticated',
            'data': {
                'token': jwt.sign(teacher.toJSON(), 'collegeManagement', {expiresIn: '100000'})
            }
        });
    } catch (error) {
        return res.status(500).json({
            'message': 'internal server error',
            'error': error
        });
    }
}