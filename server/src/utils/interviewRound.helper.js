const InterviewRound = require('../models/interviewRound');
const InterviewProcess = require('../models/interviewProcess');
const ApiError = require('./ApiError');

/*
    Shared ownership check used by question/answer flows.
    Rejects missing or archived process/round.
*/
const getInterviewRoundWithOwnershipCheck = async (
    interviewRoundId,
    userId,
    { allowArchived = false } = {}
) => {
    const interviewRound = await InterviewRound.findById(interviewRoundId);

    if (!interviewRound) {
        throw new ApiError(404, 'Interview round not found', 'NOT_FOUND');
    }

    if (!allowArchived && interviewRound.isArchived) {
        throw new ApiError(
            404,
            'Interview round not found',
            'NOT_FOUND'
        );
    }

    const interviewProcess = await InterviewProcess.findById(
        interviewRound.interviewProcess
    );

    if (!interviewProcess) {
        throw new ApiError(
            404,
            'Interview process not found',
            'NOT_FOUND'
        );
    }

    if (!allowArchived && interviewProcess.isArchived) {
        throw new ApiError(
            404,
            'Interview process not found',
            'NOT_FOUND'
        );
    }

    if (interviewProcess.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied', 'FORBIDDEN');
    }

    return {
        interviewRound,
        interviewProcess,
    };
};

module.exports = {
    getInterviewRoundWithOwnershipCheck,
};
