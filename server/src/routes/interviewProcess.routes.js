const express = require('express');
const router = express.Router();
const { createInterviewProcess, getInterviewProcesses, getInterviewProcess } = require('../controllers/interviewProcess.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', createInterviewProcess);
router.get('/', getInterviewProcesses);
router.get('/:id', getInterviewProcess);

module.exports = router;
