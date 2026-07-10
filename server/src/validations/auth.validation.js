const { z } = require('zod');

/*
    Zod schemas for auth request bodies.
    Used by validate.middleware — controllers assume body is already valid.
*/
const registerSchema = z.object({
    name: z
        .string({ error: 'All fields are required' })
        .trim()
        .min(1, 'All fields are required'),
    email: z
        .string({ error: 'All fields are required' })
        .trim()
        .min(1, 'All fields are required')
        .email('Valid email is required'),
    password: z
        .string({ error: 'All fields are required' })
        .min(1, 'All fields are required'),
});

const loginSchema = z.object({
    email: z
        .string({ error: 'All fields are required' })
        .trim()
        .min(1, 'All fields are required')
        .email('Valid email is required'),
    password: z
        .string({ error: 'All fields are required' })
        .min(1, 'All fields are required'),
});

module.exports = {
    registerSchema,
    loginSchema,
};
