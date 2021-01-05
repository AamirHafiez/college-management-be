const express = require('express');
const router = express.Router();
const passport = require('passport');

const studentsController = require('../../../controllers/api/v1/studentsController');

router.post('/create', studentsController.createStudent);
router.post('/login', studentsController.studentLogin);
router.post('/update-details',passport.authenticate('jwt', {session: false}), studentsController.updateStudentDetails);
router.get('/upcoming-assignments', passport.authenticate('jwt', {session: false}), studentsController.getUpcomingAssignments);
router.post('/upload-assignment', passport.authenticate('jwt', {session: false}), studentsController.uploadAssignment);
router.post('/add-student-to-assigment', passport.authenticate('jwt', {session: false}), studentsController.addStudentSubmittedAssignment)

module.exports = router;