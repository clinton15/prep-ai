const InterviewRound = require('../models/interviewRound');
const InterviewProcess = require('../models/interviewProcess');
const ApiError = require('./ApiError');

/*
    Shared ownership check used by question/answer flows.
    Throws ApiError so asyncHandler + error middleware return a clean JSON response.
*/
const getInterviewRoundWithOwnershipCheck = async (
    interviewRoundId,
    userId
) => {
    // Find interview round
    const interviewRound = await InterviewRound.findById(interviewRoundId);

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found');
    }

    // Find parent interview process
    const interviewProcess = await InterviewProcess.findById(
        interviewRound.interviewProcess
    );

    if (!interviewProcess) {
        throw new ApiError(404, 'Interview process not found');
    }

    // Ensure the logged-in user owns this interview process
    if (interviewProcess.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }

    return {
        interviewRound,
        interviewProcess,
    };
};

module.exports = {
    getInterviewRoundWithOwnershipCheck,
};
