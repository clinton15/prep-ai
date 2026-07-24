const mongoose = require('mongoose');

const interviewAnswerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        interviewQuestion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewQuestion',
            required: true,
        },

        answer: {
            type: String,
            required: true,
            trim: true,
        },

        // Overall score (average of technical + communication)
        score: {
            type: Number,
            min: 0,
            max: 10,
        },

        technicalScore: {
            type: Number,
            min: 0,
            max: 10,
        },

        communicationScore: {
            type: Number,
            min: 0,
            max: 10,
        },

        feedback: {
            type: String,
            trim: true,
        },

        strengths: [
            {
                type: String,
                trim: true,
            },
        ],

        improvements: [
            {
                type: String,
                trim: true,
            },
        ],

        missingConcepts: [
            {
                type: String,
                trim: true,
            },
        ],

        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

//index is used to speed up the search for answers by user and interview question
//example: find all answers for a given user and interview question
//so 1 basically means ascending order
//we can also avoid using index by using a compound index
//eg: interviewAnswerSchema.index({ user: 1, interviewQuestion: 1, isArchived: 1 });
//we can also avoid using index altogether but it will be slower
//practical eg is find all answers for a given user and interview question and isArchived is false
interviewAnswerSchema.index({ user: 1, interviewQuestion: 1 });
// Dashboard aggregates / counts by user
interviewAnswerSchema.index({ user: 1, isArchived: 1 });

module.exports = mongoose.model(
    'InterviewAnswer',
    interviewAnswerSchema
);
