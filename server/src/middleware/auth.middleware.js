const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    // JWT is sent automatically by the browser via the HTTP-only cookie
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user safely (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        // Handle deleted user case
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
