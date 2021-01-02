const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../../../controllers/api/v1/usersController');

router.use('/student', require('./student'));
router.use('/teacher', require('./teacher'));

router.get('/user-details', passport.authenticate('jwt', {session: false}), usersController.getUserDetails);

module.exports = router;