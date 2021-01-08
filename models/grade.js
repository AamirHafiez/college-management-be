const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    grade: {
        type: String,
        required: 'true'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }
}, {
    timestamps: true
});

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;