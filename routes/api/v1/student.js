const express = require('express');
const router = express.Router();
const passport = require('passport');

const studentsController = require('../../../controllers/api/v1/studentsController');

router.post('/create', studentsController.createStudent);
router.post('/login', studentsController.studentLogin);
router.post('/update-details',passport.authenticate('jwt', {session: false}), studentsController.updateStudentDetails);

module.exports = router;