const User = require('../../../models/user');
const Assignment = require('../../../models/assignment');
const Grade = require('../../../models/grade');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// signing up the teacher
module.exports.createTeacher = async (req, res) => {
    try {
        // find the teacher in the user database
        let teacher = await User.findOne({email: req.body.email})
        if(teacher) { // if teacher already exists send message teacher exists
            return res.json({
                'message': 'user already exists',
            });
        } 
        if(req.body.subject === ''){ // if subject does not exist send subject not valid
            throw "techer subject not valid"
        }
        if(req.body.password !== req.body.verify_password){ // check if password and verify pass are same
            return res.json({
                'message': 'password/verify password do not match'
            });
        }
        // hash the password before saving it to the db
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword; // put hashed password to the body
        req.body['userType'] = 'teacher'; // put new key in body as user type as teacher
        await User.create(req.body); // create the user in the db using the body
        return res.json({
            'message': 'success'
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({ 
            'message': 'internal server error',
        });
    }
}

// signing in the teacher
module.exports.teacherLogin = async (req, res) => {
    try {
        // find the teacher in user db isong email
        let teacher = await User.findOne({email: req.body.email});
        // if teacher is not found or if found but user type is student 
        if(!teacher || teacher.userType === 'student'){
            res.json({ // send teacher not found
                'message': 'teacher not found'
            });
            return;
        }
        // if above conditions are false comapare password from body with that in DB
        // as password in db is a hashed password use bcrypt to compare
        let checkPassword = await bcrypt.compare(req.body.password, teacher.password);
        if(!checkPassword){ // if password is wrong send below json as message
            res.json({
                'message': 'email/password invalid'
            });
            return;
        }
        return res.json({ // if everything goes correct authenticate user and send a jwt token with expiry 
            'message' : 'teacher authenticated', // of 24 hours, this token will be stored in cache of client
            'data': { // every request client makes it will be authenticated using this token using passport js
                'token': jwt.sign(teacher.toJSON(), 'collegeManagement', {expiresIn: 1000 * 60 * 60 * 24})
            }
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

// to update teacher details
module.exports.updateTeacherDetails = async (req, res) => {
    try {
        if(req.body.password !== req.body.verify_password){ // check if password and verify pass are same
            return res.json({
                'message': 'password/verify password do not match'
            });
        }
        if(req.body.password == ''){ // if password is nothing then just add the same password that was before
            req.body.password = req.user.password
        }
        let hashedPassword = await bcrypt.hash(req.body.password, 10); // hashing password using bcrypt
        req.body.password = hashedPassword; // putting hashed password in the body
        if(req.body.email) { // if somehow user ties to update the email this gives status unauthorized 
            return res.status(401).json({
                'message': 'Server error'
            });
        }
        await User.findByIdAndUpdate(req.user._id, req.body);// if all conditions follow then update
        return res.json({
            'message': 'updated successfully'
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'Server error'
        });
    }
}

// adding a new assignment
module.exports.addAssignment = async (req, res) => {
    let {
        title,
        description,
        year,
        deadline
    } = req.body;

    // check if titile, description, year and deadline are not empty
    if(title === '' || description === '' || year === '' || deadline === ''){
        return res.status(406).json({ // if true send not accepted
            'message': 'not acceptable'
        });
    }

    // create new key in body as teacher and set it as the id of teacher that is logged in
    req.body['teacher'] = req.user._id;

    try {
        // create a new assignment using the body
        await Assignment.create(req.body); 
        return res.json({ // send reply as added
            'message': 'assignment added'
        });   
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

// to get the assignments given by the teacher
module.exports.getAssignments = async (req, res) => {
    try {
        // find assignments using the teacher id
        let assignments =await Assignment.find({teacher: req.user._id});
        return res.json({ // send the assignments
            'assignments': assignments
        });
    } catch (error) { // if error send server error message
        return res.status(500).json(error);
    }
}

// to view the submissions 
module.exports.viewSubmissions = async (req, res) => {
    try {
        // get the assignment if from the query
        let assignmentId = req.query.id;
        // find the assignment in assignment schema and populate submitted by
        let assignment = await Assignment.findById(assignmentId).populate('submittedBy');
        // set a response list that will have all the submissions
        let response = [];

        // traverse all the submitted by list
        for(let i = 0 ; i < assignment.submittedBy.length; i++){
            // get the grade for all the submitted assignments which will be send with the response
            // so that teacher knows which assignment has been graded and what the grade is
            // find the grade using assignment id and student id
            let studentGrade = await Grade.find({
                'student': assignment.submittedBy[i]._id,
                'assignment': assignment._id
            });

            let grade = '', isGraded = false;
            if(studentGrade.length === 1){ // if the assignment has been graded of a student
                grade = studentGrade[0].grade; // get the grade of student
                isGraded = true; // put a key true that specifies that assignment has been graded
            }

            // push an object to response list having all the below details
            response.push({
                '_id': assignment.submittedBy[i]._id,
                'name': assignment.submittedBy[i].name,
                'email': assignment.submittedBy[i].email,
                'year': assignment.submittedBy[i].year,
                'grade': grade,
                'isGraded': isGraded
            });
        }
        res.json({ // send the response list
            'submittedBy': response
        });
    } catch (error) { // if error send server error message
        console.log(error)
        return res.status(500).json(error);
    }
}

// to add a grade to assignment of a student
module.exports.addGrade = async (req, res) => {
    try {
        // check if grade is found using student id and assignment id
        let isGraded = await Grade.find({
            'student': req.body.student,
            'assignment': req.body.assignment
        });
        if(isGraded.length > 0){ // if grade is found
            return res.status(409).json({'message': 'already graded'}); // send response (conflict) already graded
        }
        await Grade.create(req.body); // add grade to the body
        res.json({ // send message that grade has been added
            'message': 'grade added'
        });
    } catch (error) { // if error send server error message
        return res.status(500).json(error);
    }
}

// download the pdf of the a particular student and assignment
module.exports.downloadPDF = async (req, res) => {
    try {
        // find the user in the db
        let user = await User.findById(req.query.student);
        // get the paths submitted
        let assignmentsSubmittedPaths = user.assignmentsSubmittedPaths;
        let fileName;
        for(let i = 0; i < assignmentsSubmittedPaths.length; i++){
            // slice the paths to get assignment ids
            let slicedPaths = assignmentsSubmittedPaths[i].split('/');
            // if the assignment id from req matches to that the loop is traversing
            // assignment id is will be the 0 th index of the spit 
            if(assignmentsSubmittedPaths[i].split('/')[0] === req.query.assignment){
                // get fileName from as the filename is the last 
                fileName = slicedPaths[slicedPaths.length - 1];
            }
        }
        // get the file path by joining the paths below
        let filePath = path.join(__dirname, '../../../uploads/users/files/', fileName);
        return res.download(filePath); // send response to download as a blob file
    } catch (error) { // if error send server error message
        console.log('error', error);
        return res.status(500).json(error);
    }
}