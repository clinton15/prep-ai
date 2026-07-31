const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    targetRole: {
        type: String,
    },
    experience: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    avatar: {
        type: String,
    },
    // Hashed one-time token for password reset (plain token never stored)
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
