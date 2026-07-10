const mongoose = require('mongoose');

const InterviewQuestion = require('../models/interviewQuestion');
const {
    getInterviewRoundWithOwnershipCheck,
} = require('../utils/interviewRound.helper');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
    buildQuestionPrompt,
    generateQuestionsFromAI,
} = require('../../services/ai.service');

const generateQuestions = asyncHandler(async (req, res) => {
    const {
        interviewRoundId,
        numberOfQuestions = 10,
    } = req.body;

    const {
        interviewRound,
        interviewProcess,
    } = await getInterviewRoundWithOwnershipCheck(
        interviewRoundId,
        req.user._id
    );

    const existingQuestions =
        await InterviewQuestion.findOne({
            interviewRound: interviewRoundId,
            isArchived: false,
        });

    if (existingQuestions) {
        throw new ApiError(
            409,
            'Questions already generated for this interview round'
        );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const prompt = buildQuestionPrompt({
        company: interviewProcess.company,
        role: interviewProcess.role,
        experience: user.experience,
        roundTitle: interviewRound.title,
        roundType: interviewRound.roundType,
        numberOfQuestions,
    });

    const generatedQuestions =
        await generateQuestionsFromAI(prompt);

    const questionDocuments = generatedQuestions.map((question) => ({
        interviewRound: interviewRoundId,
        question: question.question,
        expectedAnswer: question.expectedAnswer,
        topic: question.topic,
        difficulty: question.difficulty,
        order: question.order,
    }));

    const savedQuestions = await InterviewQuestion.insertMany(
        questionDocuments
    );

    return res.status(201).json({
        message: 'Interview questions generated successfully',
        questions: savedQuestions,
    });
});

const getQuestions = asyncHandler(async (req, res) => {
    const { roundId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(roundId)) {
        throw new ApiError(400, 'Invalid interview round id');
    }

    // Find interview round
    await getInterviewRoundWithOwnershipCheck(
        roundId,
        req.user._id
    );

    // Fetch questions
    const questions = await InterviewQuestion.find({
        interviewRound: roundId,
        isArchived: false,
    }).sort({ order: 1 });

    return res.status(200).json({
        message: 'Interview questions fetched successfully',
        questions,
    });
});

module.exports = {
    generateQuestions,
    getQuestions,
};
