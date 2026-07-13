const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
    {
        interviewRound: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewRound',
            required: true,
        },

        question: {
            type: String,
            required: true,
            trim: true,
        },

        expectedAnswer: {
            type: String,
            required: true,
            trim: true,
        },

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

        order: {
            type: Number,
            required: true,
            min: 1,
        },

        // Generated → Practiced (after evaluation) → Completed (user marks done)
        status: {
            type: String,
            enum: ['Generated', 'Practiced', 'Completed'],
            default: 'Generated',
        },

        isAnswered: {
            type: Boolean,
            default: false,
        },

        isBookmarked: {
            type: Boolean,
            default: false,
        },

        notes: {
            type: String,
            trim: true,
            default: '',
        },

        // Follow-up questions link back to the parent question
        parentQuestion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewQuestion',
            default: null,
        },

        isFollowUp: {
            type: Boolean,
            default: false,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

interviewQuestionSchema.index({ interviewRound: 1, order: 1 });
interviewQuestionSchema.index({ parentQuestion: 1 });
// List roots vs follow-ups
interviewQuestionSchema.index({
    interviewRound: 1,
    isArchived: 1,
    isFollowUp: 1,
});
interviewQuestionSchema.index({ interviewRound: 1, status: 1 });
interviewQuestionSchema.index({ interviewRound: 1, topic: 1 });
interviewQuestionSchema.index({ interviewRound: 1, isBookmarked: 1 });

module.exports = mongoose.model(
    'InterviewQuestion',
    interviewQuestionSchema
);
