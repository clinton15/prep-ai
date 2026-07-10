const { z } = require('zod');

/*
    Shape checks only (required fields, ObjectId format, defaults).
    Ownership / "already generated" checks remain in the controller.
*/
const generateQuestionsSchema = z.object({
    interviewRoundId: z
        .string({ error: 'Interview round id is required' })
        .min(1, 'Interview round id is required')
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid interview round id'),
    numberOfQuestions: z
        .number()
        .int()
        .positive('Number of questions must be a positive integer')
        .max(50, 'Number of questions cannot exceed 50')
        .optional()
        .default(10),
});

module.exports = {
    generateQuestionsSchema,
};
