const express = require('express');
const router = express.Router();
const { createInterviewRound, getInterviewRounds, getInterviewRound, updateInterviewRound, archiveInterviewRound } = require('../controllers/interviewRound.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', createInterviewRound);
router.get('/', getInterviewRounds);
router.get('/:id', getInterviewRound);
router.put('/:id', updateInterviewRound);
router.delete('/:id', archiveInterviewRound);

module.exports = router;
