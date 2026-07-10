const express = require('express');
const router = express.Router();
const {
    createInterviewRound,
    getInterviewRounds,
    getInterviewRound,
    updateInterviewRound,
    archiveInterviewRound,
} = require('../controllers/interviewRound.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    createInterviewRoundSchema,
    updateInterviewRoundSchema,
} = require('../validations/interviewRound.validation');

router.use(authMiddleware);

// Body validation first; process ownership / existence checked in the controller
router.post('/', validate(createInterviewRoundSchema), createInterviewRound);
router.get('/', getInterviewRounds);
router.get('/:id', getInterviewRound);
router.put('/:id', validate(updateInterviewRoundSchema), updateInterviewRound);
router.delete('/:id', archiveInterviewRound);

module.exports = router;
