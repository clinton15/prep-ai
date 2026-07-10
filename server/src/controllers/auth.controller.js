const User = require('../models/user');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getAuthCookieOptions } = require('../utils/authCookie');

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

    const user = await User.findOne({
        email: email.trim().toLowerCase(),
    });

    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // bcrypt extracts the salt from the stored hash,
    // hashes the incoming password using the same salt,
    // and compares the results.
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Store JWT in an HTTP-only cookie (not in the response body)
    const token = generateToken(user._id);
    res.cookie('token', token, getAuthCookieOptions());

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

    return res.status(200).json({
        message: 'Logged out successfully',
    });
});

module.exports = { register, login, getUser, logout };
