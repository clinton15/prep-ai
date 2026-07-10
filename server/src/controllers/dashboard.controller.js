const InterviewProcess = require('../models/interviewProcess');
const InterviewRound = require('../models/interviewRound');
const InterviewQuestion = require('../models/interviewQuestion');
const InterviewAnswer = require('../models/interviewAnswer');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
    /*
        -------------------------------
        Interview Process Statistics
        -------------------------------
    */

    const totalApplications =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            isArchived: false,
        });

    const applied =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Applied',
            isArchived: false,
        });

    const screening =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Screening',
            isArchived: false,
        });

    const interviewing =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Interviewing',
            isArchived: false,
        });

    const offers =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Offer',
            isArchived: false,
        });

    const rejected =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Rejected',
            isArchived: false,
        });

    const withdrawn =
        await InterviewProcess.countDocuments({
            user: req.user._id,
            applicationStatus: 'Withdrawn',
            isArchived: false,
        });

    /*
        -------------------------------
        Interview Rounds
        -------------------------------
    */

    const userProcesses = await InterviewProcess.find({
        user: req.user._id,
        isArchived: false,
    }).select('_id');

    const processIds = userProcesses.map(process => process._id);

    const totalRounds =
        await InterviewRound.countDocuments({
            interviewProcess: { $in: processIds },
            isArchived: false,
        });

    const completedRounds =
        await InterviewRound.countDocuments({
            interviewProcess: { $in: processIds },
            status: 'Completed',
            isArchived: false,
        });

    const pendingRounds =
        await InterviewRound.countDocuments({
            interviewProcess: { $in: processIds },
            status: 'Pending',
            isArchived: false,
        });

    /*
        -------------------------------
        Questions
        -------------------------------
    */

    const rounds = await InterviewRound.find({
        interviewProcess: { $in: processIds },
        isArchived: false,
    }).select('_id');

    const roundIds = rounds.map(round => round._id);

    const totalQuestions =
        await InterviewQuestion.countDocuments({
            interviewRound: { $in: roundIds },
            isArchived: false,
        });

    /*
        -------------------------------
        Answers
        -------------------------------
    */

    const totalAnswers =
        await InterviewAnswer.countDocuments({
            user: req.user._id,
            isArchived: false,
        });

    /*
        -------------------------------
        Average Score
        -------------------------------
    */

    const averageScoreResult =
        await InterviewAnswer.aggregate([
            {
                $match: {
                    user: req.user._id,
                    isArchived: false,
                },
            },
            {
                $group: {
                    _id: null,
                    averageScore: {
                        $avg: '$score',
                    },
                },
            },
        ]);

    const averageScore =
        averageScoreResult.length > 0
            ? Number(
                averageScoreResult[0].averageScore.toFixed(1)
            )
            : 0;

    /*
        -------------------------------
        Recent Activity
        -------------------------------
    */

    const recentActivity =
        await InterviewProcess.find({
            user: req.user._id,
            isArchived: false,
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select(
                'company role applicationStatus updatedAt'
            );

    return res.status(200).json({
        summary: {
            applications: {
                total: totalApplications,
                applied,
                screening,
                interviewing,
                offers,
                rejected,
                withdrawn,
            },
            rounds: {
                total: totalRounds,
                completed: completedRounds,
                pending: pendingRounds,
            },
            questions: {
                generated: totalQuestions,
                answered: totalAnswers,
            },
            performance: {
                averageScore,
            },
        },
        recentActivity,
    });
});

module.exports = {
    getDashboard,
};
