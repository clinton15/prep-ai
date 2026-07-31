const InterviewProcess = require('../models/interviewProcess');
const InterviewRound = require('../models/interviewRound');
const InterviewQuestion = require('../models/interviewQuestion');
const InterviewAnswer = require('../models/interviewAnswer');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
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

    const userProcesses = await InterviewProcess.find({
        user: req.user._id,
        isArchived: false,
    }).select('_id');

    const processIds = userProcesses.map((process) => process._id);

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
            status: 'Upcoming',
            isArchived: false,
        });

    const rounds = await InterviewRound.find({
        interviewProcess: { $in: processIds },
        isArchived: false,
    }).select('_id');

    const roundIds = rounds.map((round) => round._id);

    const totalQuestions =
        await InterviewQuestion.countDocuments({
            interviewRound: { $in: roundIds },
            isArchived: false,
            isFollowUp: false,
        });

    const completedQuestions =
        await InterviewQuestion.countDocuments({
            interviewRound: { $in: roundIds },
            isArchived: false,
            status: 'Completed',
        });

    const practicedQuestions =
        await InterviewQuestion.countDocuments({
            interviewRound: { $in: roundIds },
            isArchived: false,
            status: { $in: ['Practiced', 'Completed'] },
        });

    const completionPercentage =
        totalQuestions > 0
            ? Number(
                  ((completedQuestions / totalQuestions) * 100).toFixed(1)
              )
            : 0;

    const totalAnswers =
        await InterviewAnswer.countDocuments({
            user: req.user._id,
            isArchived: false,
        });

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

    // Most practiced topics (by answer count joined to questions)
    const topicStats = await InterviewAnswer.aggregate([
        {
            $match: {
                user: req.user._id,
                isArchived: false,
            },
        },
        {
            $lookup: {
                from: 'interviewquestions',
                localField: 'interviewQuestion',
                foreignField: '_id',
                as: 'question',
            },
        },
        { $unwind: '$question' },
        {
            $group: {
                _id: '$question.topic',
                count: { $sum: 1 },
                averageScore: { $avg: '$score' },
            },
        },
        {
            $project: {
                _id: 0,
                topic: '$_id',
                count: 1,
                averageScore: {
                    $round: ['$averageScore', 1],
                },
            },
        },
    ]);

    const topTopics = [...topicStats]
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    // Weak topics: avg score below 6, at least 1 answer
    const weakTopics = [...topicStats]
        .filter((t) => t.averageScore < 6)
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 6);

    // Per-topic score trend over time (weekly buckets)
    const topicTrendRaw = await InterviewAnswer.aggregate([
        {
            $match: {
                user: req.user._id,
                isArchived: false,
            },
        },
        {
            $lookup: {
                from: 'interviewquestions',
                localField: 'interviewQuestion',
                foreignField: '_id',
                as: 'question',
            },
        },
        { $unwind: '$question' },
        {
            $group: {
                _id: {
                    topic: '$question.topic',
                    week: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: {
                                $dateTrunc: {
                                    date: '$createdAt',
                                    unit: 'week',
                                },
                            },
                        },
                    },
                },
                averageScore: { $avg: '$score' },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: '$_id.topic',
                points: {
                    $push: {
                        date: '$_id.week',
                        averageScore: {
                            $round: ['$averageScore', 1],
                        },
                        count: '$count',
                    },
                },
                totalCount: { $sum: '$count' },
                overallAverage: { $avg: '$averageScore' },
            },
        },
        {
            $project: {
                _id: 0,
                topic: '$_id',
                points: 1,
                totalCount: 1,
                overallAverage: {
                    $round: ['$overallAverage', 1],
                },
            },
        },
        { $sort: { totalCount: -1 } },
    ]);

    const topicProgress = topicTrendRaw
        .map((series) => ({
            ...series,
            points: [...series.points].sort((a, b) =>
                a.date.localeCompare(b.date)
            ),
        }))
        // Prefer weak topics with enough history; else top practiced topics
        .filter((s) => s.points.length >= 1)
        .sort((a, b) => {
            const aWeak = a.overallAverage < 6 ? 0 : 1;
            const bWeak = b.overallAverage < 6 ? 0 : 1;
            if (aWeak !== bWeak) return aWeak - bWeak;
            return b.totalCount - a.totalCount;
        })
        .slice(0, 5)
        .map(({ topic, points }) => ({ topic, points }));

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
                practiced: practicedQuestions,
                completed: completedQuestions,
                completionPercentage,
            },
            performance: {
                averageScore,
            },
            topTopics,
            weakTopics,
            topicProgress,
        },
        recentActivity,
    });
});

module.exports = {
    getDashboard,
};
