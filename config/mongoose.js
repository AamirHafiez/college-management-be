const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/college_management_development');

const db = mongoose.connection;

db.on('error', console.error.bind(console), 'Error connecting to mongoDb');

db.once('open', () => {
    console.log('Connected to database :: MongoDb');
});

module.exports = db;