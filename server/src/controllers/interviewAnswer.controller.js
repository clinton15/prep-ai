const InterviewQuestion = require('../models/interviewQuestion');
const InterviewAnswer = require('../models/interviewAnswer');
const InterviewRound = require('../models/interviewRound');
const InterviewProcess = require('../models/interviewProcess');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
    buildEvaluationPrompt,
    evaluateAnswerFromAI,
} = require('../../services/ai.service');

const evaluateAnswer = asyncHandler(async (req, res) => {
    const {
        questionId,
        answer,
    } = req.body;

    /*
        Find the question

        We need:
        - Question text
        - Expected answer
        - Interview round reference
    */
    const interviewQuestion =
        await InterviewQuestion.findById(questionId);

    if (!interviewQuestion) {
        throw new ApiError(404, 'Interview question not found');
    }

    /*
        Find parent interview round

        Needed to verify ownership
    */
    const interviewRound =
        await InterviewRound.findById(
            interviewQuestion.interviewRound
        );

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found');
    }

    /*
        Find interview process

        Ownership chain:

        User
         |
         InterviewProcess
                |
         InterviewRound
                |
         InterviewQuestion

    */
    const interviewProcess =
        await InterviewProcess.findById(
            interviewRound.interviewProcess
        );

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    // Ensure question belongs to logged-in user
    if (
        interviewProcess.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(403, 'Access denied');
    }

    /*
        Build Gemini evaluation prompt

        Input:
        - Question
        - Expected answer
        - User answer
    */
    const prompt = buildEvaluationPrompt({
        question: interviewQuestion.question,
        expectedAnswer: interviewQuestion.expectedAnswer,
        userAnswer: answer,
    });

    /*
        Call Gemini
    */
    const evaluation =
        await evaluateAnswerFromAI(prompt);

    /*
        Save answer + AI feedback
    */
    const interviewAnswer =
        await InterviewAnswer.create({
            user: req.user._id,
            interviewQuestion: questionId,
            answer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
        });

    return res.status(201).json({
        message: 'Answer evaluated successfully',
        answer: interviewAnswer,
    });
});

module.exports = {
    evaluateAnswer,
};
