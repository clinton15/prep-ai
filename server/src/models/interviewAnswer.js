const mongoose = require('mongoose');

const interviewAnswerSchema = new mongoose.Schema(
    {
        // User who submitted the answer
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Question being answered
        interviewQuestion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewQuestion',
            required: true,
        },

        // Candidate's answer
        answer: {
            type: String,
            required: true,
            trim: true,
        },

        // AI generated score out of 10
        score: {
            type: Number,
            min: 0,
            max: 10,
        },

        // AI feedback on the answer
        feedback: {
            type: String,
            trim: true,
        },

        // What the candidate did well
        strengths: [
            {
                type: String,
                trim: true,
            }
        ],

        // Areas where candidate can improve
        improvements: [
            {
                type: String,
                trim: true,
            }
        ],

        // Soft delete/archive flag
        isArchived: {
            type: Boolean,
            default: false,
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    'InterviewAnswer',
    interviewAnswerSchema
);
