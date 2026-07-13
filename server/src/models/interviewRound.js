const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema(
    {
        // Parent Interview Process
        interviewProcess: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewProcess',
            required: true,
        },

        // Example:
        // Technical Round 1
        // HR Round
        // System Design
        title: {
            type: String,
            required: true,
            trim: true,
        },

        // Whether this is an AI practice round
        // or an actual interview
        roundType: {
            type: String,
            enum: ['AI Mock', 'Real'],
            required: true,
        },

        // Current progress of this round
        status: {
            type: String,
            enum: ['Upcoming', 'Completed', 'Cancelled'],
            default: 'Upcoming',
        },

        // Mainly useful for real interviews
        scheduledAt: {
            type: Date,
        },

        // AI evaluation score
        // We keep it Number so we can easily
        // calculate averages later.
        score: {
            type: Number,
            min: 0,
            max: 100,
        },

        // AI generated feedback
        feedback: {
            type: String,
            trim: true,
        },

        // User's own notes
        notes: {
            type: String,
            trim: true,
        },

        // Soft delete
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Rounds-by-process and dashboard $in queries
interviewRoundSchema.index({ interviewProcess: 1, isArchived: 1 });

module.exports = mongoose.model('InterviewRound', interviewRoundSchema);
