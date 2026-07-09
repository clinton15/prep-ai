const mongoose = require('mongoose');

const InterviewQuestion = require('../models/interviewQuestion');
const InterviewAnswer = require('../models/interviewAnswer');
const InterviewRound = require('../models/interviewRound');
const InterviewProcess = require('../models/interviewProcess');

const {
    buildEvaluationPrompt,
    evaluateAnswerFromAI,
} = require('../../services/ai.service');

const evaluateAnswer = async (req, res) => {
    try {

        const {
            questionId,
            answer,
        } = req.body;


        // Validate required fields
        if (!questionId || !answer) {
            return res.status(400).json({
                message: 'Question id and answer are required',
            });
        }


        // Validate Mongo ObjectId
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                message: 'Invalid question id',
            });
        }


        /*
            Find the question

            We need:
            - Question text
            - Expected answer
            - Interview round reference
        */
        const interviewQuestion =
            await InterviewQuestion.findById(questionId);


        if (!interviewQuestion) {
            return res.status(404).json({
                message: 'Interview question not found',
            });
        }


        /*
            Find parent interview round

            Needed to verify ownership
        */
        const interviewRound =
            await InterviewRound.findById(
                interviewQuestion.interviewRound
            );


        if (!interviewRound) {
            return res.status(404).json({
                message: 'Interview round not found',
            });
        }


        /*
            Find interview process

            Ownership chain:

            User
             |
             InterviewProcess
                    |
             InterviewRound
                    |
             InterviewQuestion

        */
        const interviewProcess =
            await InterviewProcess.findById(
                interviewRound.interviewProcess
            );


        if (!interviewProcess) {
            return res.status(404).json({
                message: 'Interview process not found',
            });
        }


        // Ensure question belongs to logged-in user
        if (
            interviewProcess.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: 'Access denied',
            });
        }


        /*
            Build Gemini evaluation prompt

            Input:
            - Question
            - Expected answer
            - User answer
        */
        const prompt = buildEvaluationPrompt({
            question: interviewQuestion.question,
            expectedAnswer: interviewQuestion.expectedAnswer,
            userAnswer: answer,
        });


        /*
            Call Gemini
        */
        const evaluation =
            await evaluateAnswerFromAI(prompt);



        /*
            Save answer + AI feedback
        */
        const interviewAnswer =
            await InterviewAnswer.create({

                user: req.user._id,

                interviewQuestion: questionId,

                answer,

                score: evaluation.score,

                feedback: evaluation.feedback,

                strengths: evaluation.strengths,

                improvements: evaluation.improvements,

            });



        return res.status(201).json({
            message: 'Answer evaluated successfully',
            answer: interviewAnswer,
        });



    } catch (error) {

        console.error(error);

        return res.status(error.statusCode || 500).json({
            message:
                error.message ||
                'Internal server error',
        });

    }
};


module.exports = {
    evaluateAnswer,
};
