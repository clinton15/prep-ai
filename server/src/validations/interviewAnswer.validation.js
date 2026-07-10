const { z } = require('zod');

/*
    Shape checks only. Question existence and ownership stay in the controller.
*/
const evaluateAnswerSchema = z.object({
    questionId: z
        .string({ error: 'Question id and answer are required' })
        .min(1, 'Question id and answer are required')
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid question id'),
    answer: z
        .string({ error: 'Question id and answer are required' })
        .trim()
        .min(1, 'Question id and answer are required'),
});

module.exports = {
    evaluateAnswerSchema,
};
