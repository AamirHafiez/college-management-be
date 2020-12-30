const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: false
    },
    subject: {
        type: String,
        required: false
    },
    userType: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;