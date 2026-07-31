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

const forgotPasswordSchema = z.object({
    email: z
        .string({ error: 'Email is required' })
        .trim()
        .min(1, 'Email is required')
        .email('Valid email is required'),
});

const resetPasswordSchema = z.object({
    token: z
        .string({ error: 'Reset token is required' })
        .trim()
        .min(1, 'Reset token is required'),
    password: z
        .string({ error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
