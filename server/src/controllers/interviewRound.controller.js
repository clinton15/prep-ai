const mongoose = require('mongoose');
const InterviewProcess = require('../models/interviewProcess');
const InterviewRound = require('../models/interviewRound');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const createInterviewRound = asyncHandler(async (req, res) => {
    const {
        interviewProcess,
        title,
        roundType,
        scheduledAt,
        notes,
    } = req.body;

    // Verify ownership
    const existingInterviewProcess = await InterviewProcess.findOne({
        _id: interviewProcess,
        user: req.user._id,
        isArchived: false,
    });

    if (!existingInterviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    // Create round
    const interviewRound = await InterviewRound.create({
        interviewProcess,
        title,
        roundType,
        scheduledAt,
        notes,
    });

    return res.status(201).json({
        message: 'Interview round created successfully',
        interviewRound,
    });
});

const getInterviewRounds = asyncHandler(async (req, res) => {
    // Get all interview processes belonging to the logged-in user
    const interviewProcesses = await InterviewProcess.find({
        user: req.user._id,
        isArchived: false,
    }).select('_id');

    // Extract only the process IDs
    const processIds = interviewProcesses.map(
        (process) => process._id
    );

    // Fetch all interview rounds belonging to those interview processes
    const interviewRounds = await InterviewRound.find({
        interviewProcess: {
            $in: processIds,
        },
        isArchived: false,
    })
        // Replace the ObjectId with selected InterviewProcess fields
        .populate('interviewProcess', 'company role')
        // Show newest rounds first
        .sort({
            createdAt: -1,
        });

    return res.status(200).json({
        message: 'Interview rounds fetched successfully',
        interviewRounds,
    });
});

const getInterviewRound = asyncHandler(async (req, res) => {
    // Validate ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, 'Invalid interview round ID');
    }

    const interviewRound = await InterviewRound.findOne({
        _id: req.params.id,
        isArchived: false,
    });

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found');
    }

    // Verify that the parent InterviewProcess belongs to the logged-in user
    const interviewProcess = await InterviewProcess.findOne({
        _id: interviewRound.interviewProcess,
        user: req.user._id,
        isArchived: false,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview round not found');
    }

    return res.status(200).json({
        message: 'Interview round fetched successfully',
        interviewRound,
    });
});

const updateInterviewRound = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, 'Invalid interview round ID');
    }

    const interviewRound = await InterviewRound.findOne({
        _id: req.params.id,
        isArchived: false,
    });

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found');
    }

    const interviewProcess = await InterviewProcess.findOne({
        _id: interviewRound.interviewProcess,
        user: req.user._id,
        isArchived: false,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview round not found');
    }

    // Only update allowed fields
    const {
        title,
        roundType,
        status,
        scheduledAt,
        notes,
    } = req.body;

    if (title !== undefined) interviewRound.title = title;
    if (roundType !== undefined) interviewRound.roundType = roundType;
    if (status !== undefined) interviewRound.status = status;
    if (scheduledAt !== undefined) interviewRound.scheduledAt = scheduledAt;
    if (notes !== undefined) interviewRound.notes = notes;

    await interviewRound.save();

    return res.status(200).json({
        message: 'Interview round updated successfully',
        interviewRound,
    });
});

const archiveInterviewRound = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, 'Invalid interview round ID');
    }

    const interviewRound = await InterviewRound.findOne({
        _id: req.params.id,
        isArchived: false,
    });

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found');
    }

    const interviewProcess = await InterviewProcess.findOne({
        _id: interviewRound.interviewProcess,
        user: req.user._id,
        isArchived: false,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview round not found');
    }

    interviewRound.isArchived = true;

    await interviewRound.save();

    return res.status(200).json({
        message: 'Interview round archived successfully',
    });
});

module.exports = {
    createInterviewRound,
    getInterviewRounds,
    getInterviewRound,
    updateInterviewRound,
    archiveInterviewRound,
};
