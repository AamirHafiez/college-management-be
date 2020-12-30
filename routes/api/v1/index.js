const express = require('express');
const router = express.Router();
const passport = require('passport');

const studentsController = require('../../../controllers/api/v1/studentsController');
const teachersController = require('../../../controllers/api/v1/teacherController');

router.post('/create-student', studentsController.createStudent);
router.post('/student-login', studentsController.studentLogin);

router.post('/create-teacher', teachersController.createTeacher);
router.post('/teacher-login', teachersController.teacherLogin);

router.get('/student-details', passport.authenticate('jwt', {session: false}), studentsController.getStudentDetails);

router.post('/update-student-details',passport.authenticate('jwt', {session: false}), studentsController.updateStudentDetails);

module.exports = router;