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
    validateQuery,
    validateParams,
} = require('../middleware/validate.middleware');
const {
    createInterviewRoundSchema,
    updateInterviewRoundSchema,
    listInterviewRoundsQuerySchema,
    objectIdParam,
} = require('../validations/interviewRound.validation');

router.use(authMiddleware);

router.post('/', validate(createInterviewRoundSchema), createInterviewRound);
router.get(
    '/',
    validateQuery(listInterviewRoundsQuerySchema),
    getInterviewRounds
);
router.get('/:id', validateParams(objectIdParam), getInterviewRound);
router.put(
    '/:id',
    validateParams(objectIdParam),
    validate(updateInterviewRoundSchema),
    updateInterviewRound
);
router.delete(
    '/:id',
    validateParams(objectIdParam),
    archiveInterviewRound
);

module.exports = router;
