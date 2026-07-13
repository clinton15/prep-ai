const { z } = require('zod');

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

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
    difficulty: z
        .enum(['Easy', 'Medium', 'Hard', 'Mixed'], {
            error: 'Difficulty must be Easy, Medium, Hard, or Mixed',
        })
        .optional()
        .default('Mixed'),
});

const updateQuestionSchema = z
    .object({
        isBookmarked: z.boolean().optional(),
        notes: z.string().trim().max(5000).optional(),
        status: z
            .enum(['Generated', 'Practiced', 'Completed'])
            .optional(),
    })
    .refine(
        (data) =>
            data.isBookmarked !== undefined ||
            data.notes !== undefined ||
            data.status !== undefined,
        { message: 'At least one field is required' }
    );

const getQuestionsQuerySchema = z.object({
    topic: z.string().trim().optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    status: z.enum(['Generated', 'Practiced', 'Completed']).optional(),
    bookmarked: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) =>
            v === undefined ? undefined : v === 'true'
        ),
    search: z.string().trim().optional(),
    sort: z
        .enum(['order', 'difficulty', 'topic', 'createdAt', 'status'])
        .optional()
        .default('order'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
    includeFollowUps: z
        .enum(['true', 'false'])
        .optional()
        .default('true')
        .transform((v) => v === 'true'),
});

const followUpParamsSchema = z.object({
    id: objectId,
});

const questionIdParamsSchema = z.object({
    id: objectId,
});

const roundIdParamsSchema = z.object({
    roundId: objectId,
});

module.exports = {
    generateQuestionsSchema,
    updateQuestionSchema,
    getQuestionsQuerySchema,
    followUpParamsSchema,
    questionIdParamsSchema,
    roundIdParamsSchema,
};
