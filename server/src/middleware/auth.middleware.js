const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Check if header exists
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // 2. Check proper format
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    // 3. Extract token safely
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        // 4. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Fetch user safely (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        // 6. Handle deleted user case
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // 7. Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
