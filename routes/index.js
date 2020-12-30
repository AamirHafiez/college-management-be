const express = require('express');
const router = express.Router();

router.use('/api', require('./api'));
console.log('Router loaded');

module.exports = router;