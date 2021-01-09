const User = require('../../../models/user');
const Assignment = require('../../../models/assignment');
const Grade = require('../../../models/grade');

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
        return res.json({
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
        let user = await User.findById(req.user._id).populate('assignmentsSubmitted');
        let { assignmentsSubmitted } = user;
        let indexesToDelete = [];
        let assignmentIdsToDelete = {};

        assignmentsSubmitted.map((assignment) => {
            assignmentIdsToDelete[assignment._id] = true;
        });

        let count = 0;

        let todaysDate = new Date();
        assignments.map((assignment) => {
            if(assignmentIdsToDelete[assignment._id]){
                indexesToDelete.push(count);
            }
            if(assignment.deadline <= todaysDate){
                indexesToDelete.push(count);
            }
            count++;
        });

        indexesToDelete.map((index) => {
            assignments.splice(index, 1, {});
        });

        let assignmentResponse = [];
        assignments.map((i) => {
            if(i._id){
                assignmentResponse.push(i);
            }           
        });

        return res.json({
            message: 'Assignments',
            assignments: assignmentResponse
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
        let assignment = await Assignment.findById(req.headers.id);
        User.uploadedFile(req, res, (error) => {
            if (error) {
                return res.status(500).json(error);
            }
            if(req.file) {
                user.assignmentsSubmittedPaths.push(path.join(assignment._id + '/' + __dirname + '/../../../uploads/users/files') + '/' + req.file.filename);
                user.assignmentsSubmitted.push(req.headers.id);
            }
            user.save();
        });
        assignment.submittedBy.push(req.user._id);
        assignment.save();

        return res.json({
            'message': 'assignment uploaded'
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports.getSubmittedAssignments = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'assignmentsSubmitted',
            populate: {
                path: 'teacher'
            }
        });
        let assignmentsSubmitted = user.assignmentsSubmitted;
        if(assignmentsSubmitted.length <= 0){
            return res.json({
                'assignmentsSubmitted': 'none'
            });
        }
        return res.json({
            'assignmentsSubmitted': assignmentsSubmitted
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports.getGrade = async (req, res) => {
    try {
        let grade = await Grade.find({
            'student' : req.user._id,
            'assignment': req.query.assignment
        });
    
        if(grade.length === 1){
            return res.json({
                'grade': grade[0].grade
            });
        }else{
            return res.json({
                'grade': ''
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}