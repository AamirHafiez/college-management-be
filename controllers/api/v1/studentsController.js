const User = require('../../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.createStudent = async (req, res) => {
    try {
        let student = await User.findOne({email: req.body.email});
        if(student) {
            return res.json({
                'message': 'user already exists',
            });
        }
        if(req.body.year === ''){
            throw "student year not valid";
        }
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        req.body['userType'] = 'student';
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

module.exports.studentLogin = async (req, res) => {
    try {
        let student = await User.findOne({email: req.body.email});
        if(!student || student.userType === 'teacher'){
            res.json({
                'message': 'student not found'
            });
            return;
        }
        let checkPassword = await bcrypt.compare(req.body.password, student.password);
        if(!checkPassword){
            res.json({
                'message': 'email/password invalid'
            });
            return;
        }
        return res.json({
            'message' : 'student authenticated',
            'data': {
                'token': jwt.sign(student.toJSON(), 'collegeManagement', {expiresIn: '100000'})
            }
        });
    } catch (error) {
        return res.status(500).json({
            'message': 'internal server error',
            'error': error
        });
    }
}

module.exports.getStudentDetails = (req, res) => {
    return res.json({
        'message': 'user data',
        'data': req.user
    });
}

module.exports.updateStudentDetails = async (req, res) => {
    try {
        if(req.body.password !== req.body.verify_password){
            return res.json({
                'message': 'password/verify password do not match'
            });
        }
        if(req.body.password == ''){
            req.body.password = req.user
        }
        await User.findByIdAndUpdate(req.user._id, req.body);
        return res.json({
            'message': 'updated successfully'
        });
    } catch (error) {
        console.log(error);
    }
}