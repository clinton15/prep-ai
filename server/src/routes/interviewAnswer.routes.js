const express = require('express');
const router = express.Router();

const {
    evaluateAnswer,
    getAnswerByQuestion,
} = require('../controllers/interviewAnswer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { validateParams } = require('../middleware/validate.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const {
    evaluateAnswerSchema,
    questionIdParamsSchema,
} = require('../validations/interviewAnswer.validation');

router.use(authMiddleware);

router.post(
    '/evaluate',
    aiRateLimiter,
    validate(evaluateAnswerSchema),
    evaluateAnswer
);

router.get(
    '/question/:questionId',
    validateParams(questionIdParamsSchema),
    getAnswerByQuestion
);

module.exports = router;
