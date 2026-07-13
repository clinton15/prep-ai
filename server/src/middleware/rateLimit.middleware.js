const rateLimit = require('express-rate-limit');

/*
    AI rate limiter — Gemini endpoints only.
    10 requests per IP per rolling 1-minute window.
*/
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many AI requests. Please try again later.',
        code: 'RATE_LIMITED',
    },
});

/*
    Auth rate limiter — register / login brute-force protection.
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
