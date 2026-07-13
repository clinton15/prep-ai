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
    buildFollowUpPrompt,
    generateFollowUpsFromAI,
} = require('../../services/ai.service');

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

async function assertQuestionOwnership(questionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        throw new ApiError(400, 'Invalid question id');
    }

    const interviewQuestion =
        await InterviewQuestion.findById(questionId);

    if (!interviewQuestion || interviewQuestion.isArchived) {
        throw new ApiError(404, 'Interview question not found');
    }

    const { interviewRound, interviewProcess } =
        await getInterviewRoundWithOwnershipCheck(
            interviewQuestion.interviewRound,
            userId
        );

    return { interviewQuestion, interviewRound, interviewProcess };
}

const generateQuestions = asyncHandler(async (req, res) => {
    const {
        interviewRoundId,
        numberOfQuestions = 10,
        difficulty = 'Mixed',
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
            isFollowUp: false,
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
        difficulty,
    });

    const generatedQuestions =
        await generateQuestionsFromAI(prompt);

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new ApiError(502, 'AI returned no questions');
    }

    const allowedDifficulties = new Set(['Easy', 'Medium', 'Hard']);

    const questionDocuments = generatedQuestions.map((question, index) => {
        let itemDifficulty = question.difficulty;

        if (difficulty !== 'Mixed') {
            itemDifficulty = difficulty;
        } else if (!allowedDifficulties.has(itemDifficulty)) {
            itemDifficulty = 'Medium';
        }

        return {
            interviewRound: interviewRoundId,
            question: question.question,
            expectedAnswer: question.expectedAnswer,
            topic: question.topic,
            difficulty: itemDifficulty,
            order: question.order ?? index + 1,
            status: 'Generated',
        };
    });

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
    const {
        topic,
        difficulty,
        status,
        bookmarked,
        search,
        sort = 'order',
        order = 'asc',
        includeFollowUps = true,
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(roundId)) {
        throw new ApiError(400, 'Invalid interview round id');
    }

    await getInterviewRoundWithOwnershipCheck(
        roundId,
        req.user._id
    );

    const filter = {
        interviewRound: roundId,
        isArchived: false,
    };

    if (!includeFollowUps) {
        filter.isFollowUp = false;
    }

    if (topic) {
        filter.topic = new RegExp(
            `^${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
        );
    }

    if (difficulty) {
        filter.difficulty = difficulty;
    }

    if (status) {
        filter.status = status;
    }

    if (bookmarked !== undefined) {
        filter.isBookmarked = bookmarked;
    }

    if (search) {
        filter.question = {
            $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            $options: 'i',
        };
    }

    let questions = await InterviewQuestion.find(filter);

    const direction = order === 'desc' ? -1 : 1;

    questions = questions.sort((a, b) => {
        if (sort === 'difficulty') {
            return (
                (DIFFICULTY_RANK[a.difficulty] -
                    DIFFICULTY_RANK[b.difficulty]) *
                direction
            );
        }

        if (sort === 'topic') {
            return a.topic.localeCompare(b.topic) * direction;
        }

        if (sort === 'status') {
            return a.status.localeCompare(b.status) * direction;
        }

        if (sort === 'createdAt') {
            return (
                (new Date(a.createdAt) - new Date(b.createdAt)) *
                direction
            );
        }

        return (a.order - b.order) * direction;
    });

    return res.status(200).json({
        message: 'Interview questions fetched successfully',
        questions,
    });
});

const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isBookmarked, notes, status } = req.body;

    const { interviewQuestion } = await assertQuestionOwnership(
        id,
        req.user._id
    );

    if (isBookmarked !== undefined) {
        interviewQuestion.isBookmarked = isBookmarked;
    }

    if (notes !== undefined) {
        interviewQuestion.notes = notes;
    }

    if (status !== undefined) {
        // Prevent regressing Completed → Generated without going through practice
        if (
            status === 'Generated' &&
            interviewQuestion.status !== 'Generated'
        ) {
            throw new ApiError(
                400,
                'Cannot reset a practiced or completed question to Generated'
            );
        }

        interviewQuestion.status = status;

        if (status === 'Practiced' || status === 'Completed') {
            interviewQuestion.isAnswered = true;
        }
    }

    await interviewQuestion.save();

    return res.status(200).json({
        message: 'Interview question updated successfully',
        question: interviewQuestion,
    });
});

const generateFollowUps = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { interviewQuestion } = await assertQuestionOwnership(
        id,
        req.user._id
    );

    if (interviewQuestion.isFollowUp) {
        throw new ApiError(
            400,
            'Cannot generate follow-ups for a follow-up question'
        );
    }

    const existingFollowUps = await InterviewQuestion.countDocuments({
        parentQuestion: id,
        isArchived: false,
    });

    if (existingFollowUps > 0) {
        throw new ApiError(
            409,
            'Follow-up questions already generated for this question'
        );
    }

    const prompt = buildFollowUpPrompt({
        question: interviewQuestion.question,
        expectedAnswer: interviewQuestion.expectedAnswer,
        topic: interviewQuestion.topic,
        difficulty: interviewQuestion.difficulty,
    });

    const generated = await generateFollowUpsFromAI(prompt);

    if (!Array.isArray(generated) || generated.length === 0) {
        throw new ApiError(502, 'AI returned no follow-up questions');
    }

    const maxOrderResult = await InterviewQuestion.find({
        interviewRound: interviewQuestion.interviewRound,
        isArchived: false,
    })
        .sort({ order: -1 })
        .limit(1)
        .select('order');

    let nextOrder =
        maxOrderResult.length > 0 ? maxOrderResult[0].order + 1 : 1;

    const allowedDifficulties = new Set(['Easy', 'Medium', 'Hard']);

    const documents = generated.slice(0, 3).map((item, index) => {
        const itemDifficulty = allowedDifficulties.has(item.difficulty)
            ? item.difficulty
            : interviewQuestion.difficulty;

        const doc = {
            interviewRound: interviewQuestion.interviewRound,
            question: item.question,
            expectedAnswer: item.expectedAnswer,
            topic: item.topic || interviewQuestion.topic,
            difficulty: itemDifficulty,
            order: nextOrder + index,
            status: 'Generated',
            parentQuestion: interviewQuestion._id,
            isFollowUp: true,
        };

        return doc;
    });

    const savedQuestions = await InterviewQuestion.insertMany(documents);

    return res.status(201).json({
        message: 'Follow-up questions generated successfully',
        questions: savedQuestions,
    });
});

const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { interviewQuestion } = await assertQuestionOwnership(
        id,
        req.user._id
    );

    return res.status(200).json({
        message: 'Interview question fetched successfully',
        question: interviewQuestion,
    });
});

module.exports = {
    generateQuestions,
    getQuestions,
    updateQuestion,
    generateFollowUps,
    getQuestionById,
};
