const User = require('../../../models/user');
const Assignment = require('../../../models/assignment');
const Grade = require('../../../models/grade');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// to sign up student
module.exports.createStudent = async (req, res) => {
    try {
        // finding student in user database
        let student = await User.findOne({email: req.body.email});
        if(student) { // if existes send message as json
            return res.json({
                'message': 'user already exists',
            });
        }
        if(req.body.year === ''){ // server validation for students year
            throw "student year not valid";
        }
        if(req.body.password !== req.body.verify_password){ // check if password and verify pass are same
            return res.json({
                'message': 'password/verify password do not match'
            });
        }
        let hashedPassword = await bcrypt.hash(req.body.password, 10); // hashing password using bcrypt
        req.body.password = hashedPassword; // putting hashed password in the body
        req.body['userType'] = 'student'; // putting user type in body
        await User.create(req.body); // creating new user in database using whole body
        return res.json({ // send success message as json
            'message': 'success'
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

// to sigin student
module.exports.studentLogin = async (req, res) => {
    try {
        // finding student in the user database
        let student = await User.findOne({email: req.body.email});
        // if user not found or user is a type teacher send message student not found
        if(!student || student.userType === 'teacher'){
            res.json({
                'message': 'student not found'
            });
            return;
        }
        // if above conditions are false comapare password from body with that in DB
        // as password in db is a hashed password use bcrypt to compare
        let checkPassword = await bcrypt.compare(req.body.password, student.password); 
        if(!checkPassword){ // if password is wrong send below json as message
            res.json({
                'message': 'email/password invalid'
            });
            return;
        }
        return res.json({ // if everything goes correct authenticate user and send a jwt token with expiry 
            'message' : 'student authenticated', // of 24 hours, this token will be stored in cache of client
            'data': { // every request client makes it will be authenticated using this token using passport js
                'token': jwt.sign(student.toJSON(), 'collegeManagement', {expiresIn: 1000 * 60 * 60 * 24})
            }
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

// to update details of student
module.exports.updateStudentDetails = async (req, res) => {
    try {
        if(req.body.password !== req.body.verify_password){  // check if password and verify pass are same
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
        await User.findByIdAndUpdate(req.user._id, req.body); // if all conditions follow then update
        return res.json({
            'message': 'updated successfully'
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}

// to get all upcoming assignments
module.exports.getUpcomingAssignments = async (req, res) => {
    try {
        // finding all the assignments based on the year and populating with teacher that gave them
        let assignments = await Assignment.find({year: req.user.year}).populate('teacher');
        // finding the user in the database and populating the assignmentsSubmitted
        let user = await User.findById(req.user._id).populate('assignmentsSubmitted');
        let { assignmentsSubmitted } = user; // only getting the assignmentsSubmitted
        let indexesToDelete = []; 
        let assignmentIdsToDelete = {};

        // mapping submitted assignments to get what assignments have been submimitted and storing them
        // in an object like a hashmap to delete for O(1) time complexity afterwards
        assignmentsSubmitted.map((assignment) => {
            assignmentIdsToDelete[assignment._id] = true;
        });

        let count = 0;
        // getting todays date
        let todaysDate = new Date();

        // getiing the indexes of assignments that need to be deleted using the map
        assignments.map((assignment) => {
            if(assignmentIdsToDelete[assignment._id]){ // if assignment present in map
                indexesToDelete.push(count); // then push the index (count) 
            }
            if(assignment.deadline <= todaysDate){ // if assignment deadline over
                indexesToDelete.push(count); // push the index
            }
            count++;
        });

        indexesToDelete.map((index) => { // replaceing the indexed to be deleted to empty objects
            assignments.splice(index, 1, {});
        });

        let assignmentResponse = []; // initialize reponse of assignments
        assignments.map((i) => { // map through assignments having empty object if deleted
            if(i._id){ // if the assignment has id (i.e, it is not an empty object) push in response list
                assignmentResponse.push(i);
            }           
        });

        return res.json({ // send response
            message: 'Assignments',
            assignments: assignmentResponse
        });
    } catch (error) { // if error send server error message
        console.log('error: ', error);
        return res.status(500).json({
            'message': 'internal server error',
        });
    }
}


// upload an assignment
module.exports.uploadAssignment = async (req, res) => {
    try {
        let user = await User.findById(req.user._id); //  find user in the database
        let assignment = await Assignment.findById(req.headers.id); // find assignment by getting id from headers
        User.uploadedFile(req, res, (error) => { // using multer function in the user schema to uplad on server
            if (error) { // if error send server error
                return res.status(500).json(error);
            }
            if(req.file) { 
                // else push the uploaded assignment path to the submitted assignment paths of user schema
                user.assignmentsSubmittedPaths.push(path.join(assignment._id + '/' + __dirname + '/../../../uploads/users/files') + '/' + req.file.filename);
                user.assignmentsSubmitted.push(req.headers.id); // also push what assignment has been submitted
                // in the user schema
            }
            user.save(); // save user db
        });
        assignment.submittedBy.push(req.user._id); // push the user that submitted the assignment in assignment schema
        assignment.save(); // save assignment schema

        return res.json({ // return message uploaded
            'message': 'assignment uploaded'
        });
    } catch (error) { // if error send server error message
        return res.status(500).json(error);
    }
}

// get all the submitted assignments
module.exports.getSubmittedAssignments = async (req, res) => {
    try {
        // find the user and populate assignmentsSubmitted and the teacher of all submitted assignments
        let user = await User.findById(req.user._id).populate({
            path: 'assignmentsSubmitted',
            populate: {
                path: 'teacher'
            }
        });
        // get the list of submitted assignments
        let assignmentsSubmitted = user.assignmentsSubmitted;
        if(assignmentsSubmitted.length <= 0){ // if the list size is 0 send no assignment submitted
            return res.json({
                'assignmentsSubmitted': 'none'
            });
        }
        return res.json({ // else send submitted assignments
            'assignmentsSubmitted': assignmentsSubmitted
        });
    } catch (error) { // if error send server error message
        return res.status(500).json(error);
    }
}

// to get grade of a particular assignment
module.exports.getGrade = async (req, res) => {
    try {
        // find the grade in grade schema using query having student id and assignment id
        let grade = await Grade.find({
            'student' : req.user._id,
            'assignment': req.query.assignment
        });
        // if grade is found
        if(grade.length === 1){
            return res.json({ // send the grade
                'grade': grade[0].grade
            });
        }else{ // if not
            return res.json({
                'grade': '' // send empty string to denote not graded yet
            });
        }
    } catch (error) { // if error send server error message
        console.log(error);
        return res.status(500).json(error);
    }
}