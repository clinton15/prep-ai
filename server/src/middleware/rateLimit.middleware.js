const rateLimit = require('express-rate-limit');

/*
    AI-only rate limiter.

    Applied only to expensive Gemini endpoints:
    - POST /api/questions/generate
    - POST /api/answers/evaluate

    Auth and CRUD routes are intentionally not limited here.

    windowMs / max → 10 requests per IP per rolling 1-minute window.
    standardHeaders → RateLimit-* headers on responses.
*/
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many AI requests. Please try again later.',
    },
});

module.exports = {
    aiRateLimiter,
};
