const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const FILE_PATH = path.join('/uploads/users/files');

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
    },
    assignmentsSubmittedPaths: [{
        type: String,
        required: false
    }],
    assignmentsSubmitted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
},{
    timestamps: true
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', FILE_PATH));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' +file.originalname );
    }
})

userSchema.statics.uploadedFile = multer({storage: storage}).single('file');
userSchema.statics.filePath = FILE_PATH;

const User = mongoose.model('User', userSchema);

module.exports = User;