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
        match: /^https?:\/\/.+/,
    },

    notes: {
        type: String,
        trim: true,
    },

    // Optional context for AI question generation (plain text only)
    jobDescription: {
        type: String,
        trim: true,
        default: '',
    },

    resumeText: {
        type: String,
        trim: true,
        default: '',
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

// List by owner + soft-delete + sort
interviewProcessSchema.index({ user: 1, isArchived: 1, createdAt: -1 });
// Status filters / dashboard counts
interviewProcessSchema.index({
    user: 1,
    isArchived: 1,
    applicationStatus: 1,
});

module.exports = mongoose.model('InterviewProcess', interviewProcessSchema);
