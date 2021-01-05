const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    teacher:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    submittedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;