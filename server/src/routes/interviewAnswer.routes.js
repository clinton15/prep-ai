const express = require('express');
const router = express.Router();

const { evaluateAnswer } = require('../controllers/interviewAnswer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const {
    evaluateAnswerSchema,
} = require('../validations/interviewAnswer.validation');

router.use(authMiddleware);

/*
    AI evaluate flow:
    auth → rate limit (10/min) → Zod body validation → controller
*/
router.post(
    '/evaluate',
    aiRateLimiter,
    validate(evaluateAnswerSchema),
    evaluateAnswer
);

module.exports = router;
