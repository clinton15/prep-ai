const rateLimit = require('express-rate-limit');

/*
    AI rate limiter — Gemini-calling endpoints only (generate / follow-ups / evaluate).
    Default: 20 requests per authenticated user per rolling 1-hour window.
    Override with GEMINI_RATE_LIMIT_MAX and GEMINI_RATE_LIMIT_WINDOW_MS.
*/
const aiWindowMs =
    Number(process.env.GEMINI_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000;
const aiMax = Number(process.env.GEMINI_RATE_LIMIT_MAX) || 20;

const aiRateLimiter = rateLimit({
    windowMs: aiWindowMs,
    max: aiMax,
    standardHeaders: true,
    legacyHeaders: false,
    // Auth middleware runs before this on AI routes
    keyGenerator: (req) =>
        req.user?._id?.toString() || req.ip || 'anonymous',
    validate: {
        keyGeneratorIpFallback: false,
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message:
                'AI rate limit reached. Please wait and try again (default: 20 requests per hour).',
            code: 'RATE_LIMITED',
        });
    },
});

/*
    Auth rate limiter — register / login / forgot / reset brute-force protection.
    20 requests per IP per 15-minute window.
*/
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many auth attempts. Please try again later.',
        code: 'RATE_LIMITED',
    },
});

module.exports = {
    aiRateLimiter,
    authRateLimiter,
};
