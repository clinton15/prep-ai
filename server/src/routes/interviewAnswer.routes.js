const express = require('express');
const router = express.Router();

const { evaluateAnswer } = require('../controllers/interviewAnswer.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/evaluate', evaluateAnswer);

module.exports = router;