const express = require('express');
const router = express.Router();
const {
    createInterviewProcess,
    getInterviewProcesses,
    getInterviewProcess,
    updateInterviewProcess,
    archiveInterviewProcess,
} = require('../controllers/interviewProcess.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
    validateQuery,
    validateParams,
} = require('../middleware/validate.middleware');
const {
    createInterviewProcessSchema,
    updateInterviewProcessSchema,
    listInterviewProcessesQuerySchema,
    objectIdParam,
} = require('../validations/interviewProcess.validation');

router.use(authMiddleware);

router.post(
    '/',
    validate(createInterviewProcessSchema),
    createInterviewProcess
);
router.get(
    '/',
    validateQuery(listInterviewProcessesQuerySchema),
    getInterviewProcesses
);
router.get('/:id', validateParams(objectIdParam), getInterviewProcess);
router.put(
    '/:id',
    validateParams(objectIdParam),
    validate(updateInterviewProcessSchema),
    updateInterviewProcess
);
router.delete(
    '/:id',
    validateParams(objectIdParam),
    archiveInterviewProcess
);

module.exports = router;
