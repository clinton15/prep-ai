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
const {
    registerSchema,
    loginSchema,
} = require('../validations/auth.validation');

// validate → checks body shape; controller → business logic only
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getUser);

module.exports = router;
