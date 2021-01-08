const express = require('express');
const router = express.Router();
const passport = require('passport');

const studentsController = require('../../../controllers/api/v1/studentsController');

router.post('/create', studentsController.createStudent);
router.post('/login', studentsController.studentLogin);
router.post('/update-details',passport.authenticate('jwt', {session: false}), studentsController.updateStudentDetails);
router.get('/upcoming-assignments', passport.authenticate('jwt', {session: false}), studentsController.getUpcomingAssignments);
router.post('/upload-assignment', passport.authenticate('jwt', {session: false}), studentsController.uploadAssignment);
router.get('/get-submitted-assignments', passport.authenticate('jwt', {session: false}), studentsController.getSubmittedAssignments);
router.get('/get-grade', passport.authenticate('jwt', {session: false}), studentsController.getGrade);

module.exports = router;