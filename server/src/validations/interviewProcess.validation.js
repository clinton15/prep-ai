const { z } = require('zod');

/*
    Request-body schemas for interview processes.
    Enums mirror the Mongoose model so invalid statuses fail early with 400.
*/
const applicationStatusEnum = z.enum([
    'Applied',
    'Screening',
    'Interviewing',
    'Offer',
    'Rejected',
    'Withdrawn',
]);

const objectIdParam = z.object({
    id: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid interview process id'),
});

const listInterviewProcessesQuerySchema = z.object({
    company: z.string().trim().optional(),
    role: z.string().trim().optional(),
    status: applicationStatusEnum.optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

const createInterviewProcessSchema = z.object({
    company: z
        .string({ error: 'Company and role are required' })
        .trim()
        .min(1, 'Company and role are required'),
    role: z
        .string({ error: 'Company and role are required' })
        .trim()
        .min(1, 'Company and role are required'),
    recruiter: z.string().trim().optional(),
    jobUrl: z
        .string()
        .trim()
        .regex(/^https?:\/\/.+/, 'Invalid job URL')
        .optional(),
    notes: z.string().trim().optional(),
});

const updateInterviewProcessSchema = z.object({
    company: z.string().trim().min(1, 'Company cannot be empty').optional(),
    role: z.string().trim().min(1, 'Role cannot be empty').optional(),
    recruiter: z.string().trim().optional(),
    jobUrl: z
        .string()
        .trim()
        .regex(/^https?:\/\/.+/, 'Invalid job URL')
        .optional(),
    notes: z.string().trim().optional(),
    applicationStatus: applicationStatusEnum.optional(),
});

module.exports = {
    createInterviewProcessSchema,
    updateInterviewProcessSchema,
    listInterviewProcessesQuerySchema,
    objectIdParam,
};
