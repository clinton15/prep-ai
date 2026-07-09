const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
    {
        // Parent interview round
        interviewRound: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewRound',
            required: true,
        },

        // AI-generated interview question
        question: {
            type: String,
            required: true,
            trim: true,
        },

        // AI-generated ideal answer
        expectedAnswer: {
            type: String,
            required: true,
            trim: true,
        },

        // Primary topic being tested
        // e.g. React, JavaScript, CSS, Node.js
        topic: {
            type: String,
            required: true,
            trim: true,
        },

        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true,
        },

        // Display order within the interview
        order: {
            type: Number,
            required: true,
            min: 1,
        },

        // Indicates whether the candidate has answered this question
        isAnswered: {
            type: Boolean,
            default: false,
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

module.exports = mongoose.model(
    'InterviewQuestion',
    interviewQuestionSchema
);
