/**
 * Seed a demo user + sample interview data for recruiter demos.
 *
 * Usage (from server/):
 *   npm run seed:demo
 *
 * Credentials (documented in README):
 *   email: demo@prepai.dev
 *   password: DemoPass123!
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../src/models/user');
const InterviewProcess = require('../src/models/interviewProcess');
const InterviewRound = require('../src/models/interviewRound');
const InterviewQuestion = require('../src/models/interviewQuestion');
const InterviewAnswer = require('../src/models/interviewAnswer');

const DEMO_EMAIL = 'demo@prepai.dev';
const DEMO_PASSWORD = 'DemoPass123!';

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is required');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: DEMO_EMAIL });

    if (user) {
        console.log('Demo user exists — clearing prior demo data…');
        const processes = await InterviewProcess.find({ user: user._id });
        const processIds = processes.map((p) => p._id);
        const rounds = await InterviewRound.find({
            interviewProcess: { $in: processIds },
        });
        const roundIds = rounds.map((r) => r._id);
        const questions = await InterviewQuestion.find({
            interviewRound: { $in: roundIds },
        });
        const questionIds = questions.map((q) => q._id);

        await InterviewAnswer.deleteMany({
            interviewQuestion: { $in: questionIds },
        });
        await InterviewQuestion.deleteMany({ _id: { $in: questionIds } });
        await InterviewRound.deleteMany({ _id: { $in: roundIds } });
        await InterviewProcess.deleteMany({ _id: { $in: processIds } });
    } else {
        const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
        user = await User.create({
            name: 'Demo Recruiter',
            email: DEMO_EMAIL,
            password: hashed,
            experience: 3,
            targetRole: 'Frontend Engineer',
        });
        console.log('Created demo user');
    }

    const process = await InterviewProcess.create({
        user: user._id,
        company: 'Acme Labs',
        role: 'Frontend Engineer',
        applicationStatus: 'Interviewing',
        recruiter: 'Alex Recruiter',
        notes: 'Seeded demo process for portfolio walkthroughs.',
    });

    await InterviewProcess.create({
        user: user._id,
        company: 'Northwind',
        role: 'Full-Stack Engineer',
        applicationStatus: 'Applied',
        notes: 'Second demo application.',
    });

    const round = await InterviewRound.create({
        interviewProcess: process._id,
        title: 'Technical Round 1',
        roundType: 'AI Mock',
        status: 'Upcoming',
        notes: 'Seeded practice round.',
    });

    const questionDocs = [
        {
            question: 'Explain how React reconciliation works.',
            expectedAnswer:
                'React builds a virtual DOM tree and diffs it against the previous tree to determine minimal DOM updates.',
            topic: 'React',
            difficulty: 'Medium',
            order: 1,
            status: 'Practiced',
            isAnswered: true,
        },
        {
            question: 'What are React Hooks and why were they introduced?',
            expectedAnswer:
                'Hooks let function components use state and lifecycle features without classes, improving reuse and composition.',
            topic: 'React Hooks',
            difficulty: 'Easy',
            order: 2,
            status: 'Practiced',
            isAnswered: true,
            isBookmarked: true,
        },
        {
            question: 'Describe the event loop in Node.js.',
            expectedAnswer:
                'Node uses a single-threaded event loop with a call stack, callback queue, and libuv for async I/O.',
            topic: 'Node.js',
            difficulty: 'Hard',
            order: 3,
            status: 'Generated',
        },
        {
            question: 'How would you optimize a slow React list render?',
            expectedAnswer:
                'Use virtualization, memoization, stable keys, and avoid unnecessary re-renders with React.memo and careful state design.',
            topic: 'React',
            difficulty: 'Medium',
            order: 4,
            status: 'Completed',
            isAnswered: true,
        },
        {
            question: 'What is the difference between SQL and NoSQL?',
            expectedAnswer:
                'SQL databases are relational with schemas; NoSQL stores are flexible document/key-value/graph oriented for scale and agility.',
            topic: 'MongoDB',
            difficulty: 'Easy',
            order: 5,
            status: 'Practiced',
            isAnswered: true,
        },
    ];

    const questions = await InterviewQuestion.insertMany(
        questionDocs.map((q) => ({
            ...q,
            interviewRound: round._id,
        }))
    );

    const answerSeeds = [
        {
            q: 0,
            answer: 'React compares virtual trees and updates only changed nodes.',
            score: 7,
            technicalScore: 7,
            communicationScore: 7,
            feedback: 'Solid overview; could mention keys and fiber.',
            strengths: ['Clear mental model'],
            improvements: ['Mention Fiber and concurrent features'],
            missingConcepts: ['Fiber architecture'],
        },
        {
            q: 1,
            answer: 'Hooks add state to function components.',
            score: 5,
            technicalScore: 4,
            communicationScore: 6,
            feedback: 'Too brief; missing motivation and rules of hooks.',
            strengths: ['Correct basic idea'],
            improvements: ['Explain rules of hooks and custom hooks'],
            missingConcepts: ['Rules of Hooks', 'Custom hooks'],
        },
        {
            q: 3,
            answer:
                'I would virtualize long lists and memoize row components to cut re-renders.',
            score: 8.5,
            technicalScore: 9,
            communicationScore: 8,
            feedback: 'Strong practical answer.',
            strengths: ['Actionable optimizations'],
            improvements: ['Discuss profiling tools'],
            missingConcepts: [],
        },
        {
            q: 4,
            answer: 'SQL is tables; MongoDB is documents.',
            score: 6,
            technicalScore: 6,
            communicationScore: 6,
            feedback: 'Basic but incomplete trade-offs.',
            strengths: ['Simple distinction'],
            improvements: ['Discuss consistency and query patterns'],
            missingConcepts: ['ACID vs BASE'],
        },
    ];

    await InterviewAnswer.insertMany(
        answerSeeds.map((a) => ({
            user: user._id,
            interviewQuestion: questions[a.q]._id,
            answer: a.answer,
            score: a.score,
            technicalScore: a.technicalScore,
            communicationScore: a.communicationScore,
            feedback: a.feedback,
            strengths: a.strengths,
            improvements: a.improvements,
            missingConcepts: a.missingConcepts,
        }))
    );

    console.log('Demo data seeded successfully.');
    console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    await mongoose.disconnect();
}

seed().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch {
        // ignore
    }
    process.exit(1);
});
