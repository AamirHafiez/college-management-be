const User = require('../../../models/user');
const Assignment = require('../../../models/assignment');
const Grade = require('../../../models/grade');

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
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
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
                'token': jwt.sign(teacher.toJSON(), 'collegeManagement', {expiresIn: 1000 * 60 * 60 * 24})
            }
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

module.exports.updateTeacherDetails = async (req, res) => {
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
            'message': 'Server error'
        });
    }
}

module.exports.addAssignment = async (req, res) => {
    let {
        title,
        description,
        year,
        deadline
    } = req.body;

    if(title === '' || description === '' || year === '' || deadline === ''){
        return res.status(406).json({
            'message': 'not acceptable'
        });
    }

    req.body['teacher'] = req.user._id;

    try {
        await Assignment.create(req.body);
        return res.json({
            'message': 'assignment added'
        });   
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

module.exports.getAssignments = async (req, res) => {

    try {
        let assignments =await Assignment.find({teacher: req.user._id});
        return res.json({
            'assignments': assignments
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

module.exports.viewSubmissions = async (req, res) => {
    try {
        let assignmentId = req.query.id;
        let assignment = await Assignment.findById(assignmentId).populate('submittedBy');

        let response = [];

        for(let i =0 ; i < assignment.submittedBy.length; i++){
            
            let studentGrade = await Grade.find({
                'student': assignment.submittedBy[i]._id,
                'assignment': assignment._id
            });

            let grade = '', isGraded = false;
            if(studentGrade.length === 1){
                grade = studentGrade[0].grade;
                isGraded = true;
            }

            response.push({
                '_id': assignment.submittedBy[i]._id,
                'name': assignment.submittedBy[i].name,
                'email': assignment.submittedBy[i].email,
                'year': assignment.submittedBy[i].year,
                'grade': grade,
                'isGraded': isGraded
            });
        }

        res.json({
            'submittedBy': response
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json(error);
    }
}

module.exports.addGrade = async (req, res) => {
    try {
        let isGraded = await Grade.find({
            'student': req.body.student,
            'assignment': req.body.assignment
        });
        if(isGraded.length > 0){
            console.log('already present');
            return res.status(409).json({'message': 'already graded'});
        }
        await Grade.create(req.body);
        res.json({
            'message': 'grade added'
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}