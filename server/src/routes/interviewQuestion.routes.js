const express = require('express');
const router = express.Router();
const {
    generateQuestions,
    getQuestions,
} = require('../controllers/interviewQuestion.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { aiRateLimiter } = require('../middleware/rateLimit.middleware');
const {
    generateQuestionsSchema,
} = require('../validations/interviewQuestion.validation');

router.use(authMiddleware);

/*
    AI generate flow:
    auth → rate limit (10/min) → Zod body validation → controller
*/
router.post(
    '/generate',
    aiRateLimiter,
    validate(generateQuestionsSchema),
    generateQuestions
);
router.get('/:roundId', getQuestions);

module.exports = router;
