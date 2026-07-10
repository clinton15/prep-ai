const { z } = require('zod');

/*
    Request-body schemas for interview rounds.
    ObjectId format is validated here; DB ownership is checked in the controller.
*/
const createInterviewRoundSchema = z.object({
    interviewProcess: z
        .string({
            error: 'Interview process, title and round type are required',
        })
        .min(1, 'Interview process, title and round type are required')
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid interview process ID'),
    title: z
        .string({
            error: 'Interview process, title and round type are required',
        })
        .trim()
        .min(1, 'Interview process, title and round type are required'),
    roundType: z.enum(['AI Mock', 'Real'], {
        error: 'Round type must be AI Mock or Real',
    }),
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().trim().optional(),
});

const updateInterviewRoundSchema = z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    roundType: z
        .enum(['AI Mock', 'Real'], {
            error: 'Round type must be AI Mock or Real',
        })
        .optional(),
    status: z
        .enum(['Upcoming', 'Completed', 'Cancelled'], {
            error: 'Status must be Upcoming, Completed, or Cancelled',
        })
        .optional(),
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().trim().optional(),
});

module.exports = {
    createInterviewRoundSchema,
    updateInterviewRoundSchema,
};
