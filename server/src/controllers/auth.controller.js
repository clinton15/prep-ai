const User = require('../models/user');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

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

    const token = generateToken(user._id);

    return res.status(201).json({
        message: 'User created successfully',
        token,
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

    const token = generateToken(user._id);

    return res.status(200).json({
        message: 'Login successful',
        token,
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

module.exports = { register, login, getUser };
