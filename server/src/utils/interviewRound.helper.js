const InterviewRound = require('../models/interviewRound');
const InterviewProcess = require('../models/interviewProcess');

const getInterviewRoundWithOwnershipCheck = async (
    interviewRoundId,
    userId
) => {
    // Find interview round
    const interviewRound = await InterviewRound.findById(interviewRoundId);

    if (!interviewRound) {
        const error = new Error('Interview round not found');
        error.statusCode = 404;
        throw error;
    }

    // Find parent interview process
    const interviewProcess = await InterviewProcess.findById(
        interviewRound.interviewProcess
    );

    if (!interviewProcess) {
        const error = new Error('Interview process not found');
        error.statusCode = 404;
        throw error;
    }

    // Ensure the logged-in user owns this interview process
    if (interviewProcess.user.toString() !== userId.toString()) {
        const error = new Error('Access denied');
        error.statusCode = 403;
        throw error;
    }

    return {
        interviewRound,
        interviewProcess,
    };
};

module.exports = {
    getInterviewRoundWithOwnershipCheck,
};
