const mongoose = require('mongoose');

const InterviewQuestion = require('../models/interviewQuestion');
const {
    getInterviewRoundWithOwnershipCheck,
} = require('../utils/interviewRound.helper');
const User = require('../models/user');

const {
    buildQuestionPrompt,
    generateQuestionsFromAI,
} = require('../../services/ai.service');

const generateQuestions = async (req, res) => {
    try {

        const {
            interviewRoundId,
            numberOfQuestions = 10,
        } = req.body;

        if (!interviewRoundId) {
            return res.status(400).json({
                message: 'Interview round id is required',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(interviewRoundId)) {
            return res.status(400).json({
                message: 'Invalid interview round id',
            });
        }

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
            return res.status(409).json({
                message:
                    'Questions already generated for this interview round',
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
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

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message || 'Internal server error',
        });
    }
}

const getQuestions = async (req, res) => {
    try {

        const { roundId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(roundId)) {
            return res.status(400).json({
                message: 'Invalid interview round id',
            });
        }

        // Find interview round
        const {
            interviewRound,
        } = await getInterviewRoundWithOwnershipCheck(
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

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            message: error.message || 'Internal server error',
        });
    }
};

module.exports = {
    generateQuestions,
    getQuestions,
}
