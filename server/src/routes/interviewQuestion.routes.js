const express = require('express');
const router = express.Router();
const { generateQuestions, getQuestions } = require('../controllers/interviewQuestion.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/generate', generateQuestions);
router.get('/:roundId', getQuestions);

module.exports = router;
