const InterviewQuestion = require('../models/interviewQuestion');
const InterviewAnswer = require('../models/interviewAnswer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
    getInterviewRoundWithOwnershipCheck,
} = require('../utils/interviewRound.helper');

const {
    buildEvaluationPrompt,
    evaluateAnswerFromAI,
} = require('../../services/ai.service');

async function assertQuestionOwnership(questionId, userId) {
    const interviewQuestion =
        await InterviewQuestion.findById(questionId);

    if (!interviewQuestion || interviewQuestion.isArchived) {
        throw new ApiError(
            404,
            'Interview question not found',
            'NOT_FOUND'
        );
    }

    const { interviewRound, interviewProcess } =
        await getInterviewRoundWithOwnershipCheck(
            interviewQuestion.interviewRound,
            userId
        );

    return { interviewQuestion, interviewRound, interviewProcess };
}

function normalizeEvaluation(evaluation) {
    const technicalScore = Number(
        evaluation.technicalScore ?? evaluation.score ?? 0
    );
    const communicationScore = Number(
        evaluation.communicationScore ?? evaluation.score ?? 0
    );

    const score =
        evaluation.score != null
            ? Number(evaluation.score)
            : Number(
                  ((technicalScore + communicationScore) / 2).toFixed(1)
              );

    return {
        technicalScore: Math.min(10, Math.max(0, technicalScore)),
        communicationScore: Math.min(10, Math.max(0, communicationScore)),
        score: Math.min(10, Math.max(0, score)),
        feedback: evaluation.feedback ?? '',
        strengths: Array.isArray(evaluation.strengths)
            ? evaluation.strengths
            : [],
        improvements: Array.isArray(evaluation.improvements)
            ? evaluation.improvements
            : [],
        missingConcepts: Array.isArray(evaluation.missingConcepts)
            ? evaluation.missingConcepts
            : [],
    };
}

const evaluateAnswer = asyncHandler(async (req, res) => {
    const { questionId, answer } = req.body;

    const { interviewQuestion } = await assertQuestionOwnership(
        questionId,
        req.user._id
    );

    const prompt = buildEvaluationPrompt({
        question: interviewQuestion.question,
        expectedAnswer: interviewQuestion.expectedAnswer,
        userAnswer: answer,
    });

    const evaluation = normalizeEvaluation(
        await evaluateAnswerFromAI(prompt)
    );

    const interviewAnswer = await InterviewAnswer.create({
        user: req.user._id,
        interviewQuestion: questionId,
        answer,
        score: evaluation.score,
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        missingConcepts: evaluation.missingConcepts,
    });

    if (interviewQuestion.status === 'Generated') {
        interviewQuestion.status = 'Practiced';
    }
    interviewQuestion.isAnswered = true;
    await interviewQuestion.save();

    return res.status(201).json({
        message: 'Answer evaluated successfully',
        answer: interviewAnswer,
    });
});

const getAnswerByQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    await assertQuestionOwnership(questionId, req.user._id);

    const answer = await InterviewAnswer.findOne({
        user: req.user._id,
        interviewQuestion: questionId,
        isArchived: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
        message: answer
            ? 'Answer fetched successfully'
            : 'No answer found for this question',
        answer,
    });
});

module.exports = {
    evaluateAnswer,
    getAnswerByQuestion,
};
