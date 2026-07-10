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
    createInterviewProcessSchema,
    updateInterviewProcessSchema,
} = require('../validations/interviewProcess.validation');

router.use(authMiddleware);

// Body validation runs before the controller; ownership checks stay in the controller
router.post('/', validate(createInterviewProcessSchema), createInterviewProcess);
router.get('/', getInterviewProcesses);
router.get('/:id', getInterviewProcess);
router.put('/:id', validate(updateInterviewProcessSchema), updateInterviewProcess);
router.delete('/:id', archiveInterviewProcess);

module.exports = router;
