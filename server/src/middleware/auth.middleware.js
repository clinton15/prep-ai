const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        throw new ApiError(401, 'No token provided', 'UNAUTHORIZED');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new ApiError(401, 'User not found', 'UNAUTHORIZED');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            'Invalid or expired token',
            'UNAUTHORIZED'
        );
    }
});

module.exports = authMiddleware;
