const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getUser,
    logout,
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authRateLimiter } = require('../middleware/rateLimit.middleware');
const {
    registerSchema,
    loginSchema,
} = require('../validations/auth.validation');

router.post(
    '/register',
    authRateLimiter,
    validate(registerSchema),
    register
);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getUser);

module.exports = router;
