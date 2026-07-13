/*
    Global Express error middleware (4-argument signature).

    Response envelope:
    { success: false, message, code, stack? }
*/
const ApiError = require('../utils/ApiError');

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || ApiError.codeFromStatus(statusCode);

    // Unexpected / non-operational errors: hide internals in production
    if (!err.isOperational && process.env.NODE_ENV === 'production') {
        statusCode = 500;
        message = 'Internal server error';
        code = 'INTERNAL_ERROR';
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid id';
        code = 'VALIDATION_ERROR';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message || 'Validation failed';
        code = 'VALIDATION_ERROR';
    }

    const response = {
        success: false,
        message,
        code,
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    } else {
        console.error(`[${code}] ${message}`);
    }

    return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
