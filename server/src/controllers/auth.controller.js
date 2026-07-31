const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getAuthCookieOptions } = require('../utils/authCookie');
const logger = require('../utils/logger');

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const GENERIC_FORGOT_MESSAGE =
    'If an account exists for that email, a password reset link has been generated.';

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function buildClientOrigin() {
    return (process.env.CLIENT_URL || '')
        .trim()
        .replace(/\/+$/, '');
}

/*
    Controllers are wrapped with asyncHandler so thrown ApiErrors
    (and any unexpected errors) reach the global error middleware.
    Body field validation already ran in the route via validate(...).
*/
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
    });

    // Business rule — not Zod (needs a DB lookup)
    if (existingUser) {
        logger.warn('auth.register', {
            email: email.trim().toLowerCase(),
            success: false,
            reason: 'already_exists',
        });
        throw new ApiError(409, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
    });

    // Store JWT in an HTTP-only cookie (not in the response body)
    const token = generateToken(user._id);
    res.cookie('token', token, getAuthCookieOptions());

    logger.info('auth.register', {
        email: user.email,
        userId: user._id.toString(),
        success: true,
    });

    return res.status(201).json({
        message: 'User created successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            targetRole: user.targetRole,
            experience: user.experience,
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail,
    });

    if (!user) {
        logger.warn('auth.login', {
            email: normalizedEmail,
            success: false,
            reason: 'invalid_credentials',
        });
        throw new ApiError(401, 'Invalid credentials');
    }

    // bcrypt extracts the salt from the stored hash,
    // hashes the incoming password using the same salt,
    // and compares the results.
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        logger.warn('auth.login', {
            email: normalizedEmail,
            success: false,
            reason: 'invalid_credentials',
        });
        throw new ApiError(401, 'Invalid credentials');
    }

    // Store JWT in an HTTP-only cookie (not in the response body)
    const token = generateToken(user._id);
    res.cookie('token', token, getAuthCookieOptions());

    logger.info('auth.login', {
        email: user.email,
        userId: user._id.toString(),
        success: true,
    });

    return res.status(200).json({
        message: 'Login successful',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            targetRole: user.targetRole,
            experience: user.experience,
        },
    });
});

const getUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json({
        message: 'User fetched successfully',
        user,
    });
});

const logout = asyncHandler(async (req, res) => {
    // Match cookie attributes used when setting (exclude maxAge when clearing)
    const { maxAge, ...clearOptions } = getAuthCookieOptions();
    res.clearCookie('token', clearOptions);

    logger.info('auth.logout', {
        userId: req.user?._id?.toString() || null,
        success: true,
    });

    return res.status(200).json({
        message: 'Logged out successfully',
    });
});

/*
    Generates a short-lived reset token, stores its hash on the user,
    and logs the reset link (no email provider yet). In non-production,
    also returns resetUrl in the response for convenient local testing.
*/
const forgotPassword = asyncHandler(async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    // Always return the same message to avoid email enumeration
    if (!user) {
        logger.info('auth.forgot_password', {
            email,
            success: true,
            userFound: false,
        });
        return res.status(200).json({ message: GENERIC_FORGOT_MESSAGE });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashResetToken(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    await user.save();

    const clientOrigin = buildClientOrigin();
    const resetUrl = clientOrigin
        ? `${clientOrigin}/reset-password?token=${rawToken}`
        : null;

    logger.info('auth.forgot_password', {
        email: user.email,
        userFound: true,
        expiresAt: user.resetPasswordExpires.toISOString(),
        resetUrl: resetUrl || `(token only) ${rawToken}`,
    });

    const payload = { message: GENERIC_FORGOT_MESSAGE };

    if (process.env.NODE_ENV !== 'production') {
        payload.resetUrl = resetUrl;
        payload.resetToken = rawToken;
    }

    return res.status(200).json(payload);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
        logger.warn('auth.reset_password', {
            success: false,
            reason: 'invalid_or_expired_token',
        });
        throw new ApiError(400, 'Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Invalidate any existing session cookie after a password change
    const { maxAge, ...clearOptions } = getAuthCookieOptions();
    res.clearCookie('token', clearOptions);

    logger.info('auth.reset_password', {
        email: user.email,
        userId: user._id.toString(),
        success: true,
    });

    return res.status(200).json({
        message: 'Password reset successful. You can sign in with your new password.',
    });
});

module.exports = {
    register,
    login,
    getUser,
    logout,
    forgotPassword,
    resetPassword,
};
