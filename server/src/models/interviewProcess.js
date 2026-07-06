const mongoose = require('mongoose');

const interviewProcessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    company: {
        type: String,
        required: true,
        trim: true,
    },

    role: {
        type: String,
        required: true,
        trim: true,
    },

    applicationStatus: {
        type: String,
        enum: [
            'Applied',
            'Screening',
            'Interviewing',
            'Offer',
            'Rejected',
            'Withdrawn'
        ],
        default: 'Applied',
    },

    recruiter: {
        type: String,
        trim: true,
    },

    jobUrl: {
        type: String,
        trim: true,
    },

    notes: {
        type: String,
        trim: true,
    },

    appliedDate: {
        type: Date,
        default: Date.now,
    },

    isArchived: {
        type: Boolean,
        default: false,
    }

}, {
    timestamps: true,
});

module.exports = mongoose.model('InterviewProcess', interviewProcessSchema);
