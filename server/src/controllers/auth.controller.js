const User = require("../models/user");
const bcrypt = require('bcryptjs');
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email: email.trim().toLowerCase(), password: hashedPassword });

        const token = generateToken(user._id);

        return res.status(201).json({
            message: 'User created successfully', token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                targetRole: user.targetRole,
                experience: user.experience,
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // bcrypt extracts the salt from the stored hash,
        // hashes the incoming password using the same salt,
        // and compares the results.
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: 'Login successful', token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                targetRole: user.targetRole,
                experience: user.experience,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ message: 'User fetched successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { register, login, getUser };