const User = require('../../../models/user');
const Assignment = require('../../../models/assignment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

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
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
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
                'token': jwt.sign(student.toJSON(), 'collegeManagement', {expiresIn: 1000 * 60 * 60 * 24})
            }
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

module.exports.updateStudentDetails = async (req, res) => {
    try {
        if(req.body.password !== req.body.verify_password){
            return res.json({
                'message': 'password/verify password do not match'
            });
        }
        if(req.body.password == ''){
            req.body.password = req.user.password
        }
        if(req.body.email) {
            return res.status(401).json({
                'message': 'Server error'
            });
        }
        await User.findByIdAndUpdate(req.user._id, req.body);
        return res.json({
            'message': 'updated successfully'
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

module.exports.getUpcomingAssignments = async (req, res) => {

    try {
        let assignments = await Assignment.find({year: req.user.year}).populate('teacher');
        assignments.map((i) => {
            i.teacher['password'] = '';
            i.teacher['email'] = '';
        });
        return res.json({
            message: 'Assignments',
            assignments: assignments
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

module.exports.uploadAssignment = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        User.uploadedFile(req, res, (error) => {
            if (error) {
                return res.status(500).json(error);
            }
            if(req.file) {
                user.assignmentsSubmittedPaths.push(path.join(__dirname + '/../../../uploads/users/files') + '/' + req.file.filename);
            }
            user.save();
        });
        return res.json({
            'message': 'assignment uploaded'
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports.addStudentSubmittedAssignment = async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.body.id);
        let user = await User.findById(req.user._id);
        user.assignmentsSubmitted.push(req.body.id);
        assignment.submittedBy.push(req.user._id);
        assignment.save();
        user.save();
        return res.json({
            'message': 'assignment uploaded'
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}