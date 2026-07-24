const express = require('express');
const router = express.Router();
const {
    generateQuestions,
    getQuestions,
    updateQuestion,
    generateFollowUps,
    getQuestionById,
    getExpectedAnswer,
} = require('../controllers/interviewQuestion.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    validateQuery,
    validateParams,
} = require('../middleware/validate.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const {
    generateQuestionsSchema,
    updateQuestionSchema,
    getQuestionsQuerySchema,
    followUpParamsSchema,
    questionIdParamsSchema,
    roundIdParamsSchema,
} = require('../validations/interviewQuestion.validation');

router.use(authMiddleware);

router.post(
    '/generate',
    aiRateLimiter,
    validate(generateQuestionsSchema),
    generateQuestions
);

router.post(
    '/:id/follow-ups',
    aiRateLimiter,
    validateParams(followUpParamsSchema),
    generateFollowUps
);

router.patch(
    '/:id',
    validateParams(questionIdParamsSchema),
    validate(updateQuestionSchema),
    updateQuestion
);

router.get(
    '/item/:id',
    validateParams(questionIdParamsSchema),
    getQuestionById
);

router.get(
    '/:id/expected-answer',
    validateParams(questionIdParamsSchema),
    getExpectedAnswer
);

router.get(
    '/:roundId',
    validateParams(roundIdParamsSchema),
    validateQuery(getQuestionsQuerySchema),
    getQuestions
);

module.exports = router;
