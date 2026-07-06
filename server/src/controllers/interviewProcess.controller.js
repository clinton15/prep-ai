const InterviewProcess = require('../models/interviewProcess');

const createInterviewProcess = async (req, res) => {
    try {
        const {
            company,
            role,
            recruiter,
            jobUrl,
            notes
        } = req.body;

        if (!company || !role) {
            return res.status(400).json({ message: 'Company and role are required' });
        }

        const interviewProcess = await InterviewProcess.create({
            user: req.user._id,
            company,
            role,
            recruiter,
            jobUrl,
            notes,
        });

        return res.status(201).json({ message: 'Interview process created successfully', interviewProcess });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getInterviewProcesses = async (req, res) => {
    try {
        // sort by createdAt in descending order
        const interviewProcesses = await InterviewProcess.find({ user: req.user._id, isArchived: false }).sort({ createdAt: -1 });
        return res.status(200).json({ message: 'Interview processes fetched successfully', interviewProcesses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getInterviewProcess = async (req, res) => {
    try {

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid interview process ID',
            });
        }

        // We use findOne() because we're fetching a single interview process
        // that matches both the authenticated user and the provided ID.
        const interviewProcess = await InterviewProcess.findOne({ user: req.user._id, _id: req.params.id });
        if (!interviewProcess) {
            return res.status(404).json({ message: 'Interview process not found' });
        }
        return res.status(200).json({ message: 'Interview process fetched successfully', interviewProcess });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createInterviewProcess, getInterviewProcesses, getInterviewProcess };
