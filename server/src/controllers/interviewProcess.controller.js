const mongoose = require('mongoose');
const InterviewProcess = require('../models/interviewProcess');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const createInterviewProcess = asyncHandler(async (req, res) => {
    const {
        company,
        role,
        recruiter,
        jobUrl,
        notes,
    } = req.body;

    const interviewProcess = await InterviewProcess.create({
        user: req.user._id,
        company,
        role,
        recruiter,
        jobUrl,
        notes,
    });

    return res.status(201).json({
        message: 'Interview process created successfully',
        interviewProcess,
    });
});

const getInterviewProcesses = asyncHandler(async (req, res) => {
    const {
        company,
        role,
        status,
        page = 1,
        limit = 10,
    } = req.query;

    const query = {
        user: req.user._id,
        isArchived: false,
    };

    // Company search
    if (company) {
        query.company = {
            $regex: company,
            $options: 'i',
        };
    }

    // Role search
    if (role) {
        query.role = {
            $regex: role,
            $options: 'i',
        };
    }

    // Application status
    if (status) {
        query.applicationStatus = status;
    }

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const total = await InterviewProcess.countDocuments(query);

    const interviewProcesses =
        await InterviewProcess.find(query)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

    return res.status(200).json({
        message: 'Interview processes fetched successfully',
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        interviewProcesses,
    });
});

const getInterviewProcess = asyncHandler(async (req, res) => {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, 'Invalid interview process ID');
    }

    // We use findOne() because we're fetching a single interview process
    // that matches both the authenticated user and the provided ID.
    const interviewProcess = await InterviewProcess.findOne({
        user: req.user._id,
        _id: req.params.id,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    return res.status(200).json({
        message: 'Interview process fetched successfully',
        interviewProcess,
    });
});

const updateInterviewProcess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid interview process id');
    }

    // Find process belonging to logged-in user
    const interviewProcess = await InterviewProcess.findOne({
        _id: id,
        user: req.user._id,
        isArchived: false,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    // Only allow these fields to be updated
    const {
        company,
        role,
        recruiter,
        jobUrl,
        notes,
        applicationStatus,
    } = req.body;

    if (company !== undefined) {
        interviewProcess.company = company;
    }

    if (role !== undefined) {
        interviewProcess.role = role;
    }

    if (recruiter !== undefined) {
        interviewProcess.recruiter = recruiter;
    }

    if (jobUrl !== undefined) {
        interviewProcess.jobUrl = jobUrl;
    }

    if (notes !== undefined) {
        interviewProcess.notes = notes;
    }

    if (applicationStatus !== undefined) {
        interviewProcess.applicationStatus = applicationStatus;
    }

    await interviewProcess.save();

    return res.status(200).json({
        message: 'Interview process updated successfully',
        interviewProcess,
    });
});

const archiveInterviewProcess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid interview process id');
    }

    const interviewProcess = await InterviewProcess.findOne({
        _id: id,
        user: req.user._id,
        isArchived: false,
    });

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    interviewProcess.isArchived = true;

    await interviewProcess.save();

    return res.status(200).json({
        message: 'Interview process archived successfully',
    });
});

module.exports = {
    createInterviewProcess,
    getInterviewProcesses,
    getInterviewProcess,
    updateInterviewProcess,
    archiveInterviewProcess,
};
