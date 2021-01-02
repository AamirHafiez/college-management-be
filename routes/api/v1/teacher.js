const express = require('express');
const router = express.Router();
const passport = require('passport');


const teachersController = require('../../../controllers/api/v1/teacherController');

router.post('/create', teachersController.createTeacher);
router.post('/login', teachersController.teacherLogin);
router.post('/update-details', passport.authenticate('jwt', {session: false}), teachersController.updateTeacherDetails);
router.post('/add-assignment', passport.authenticate('jwt', {session: false}), teachersController.addAssignment);

module.exports = router;