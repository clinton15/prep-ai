/*
    Custom error class used across controllers and middleware.

    Flow:
    1. Controller / middleware throws: throw new ApiError(404, 'Not found')
    2. asyncHandler catches it and calls next(err)
    3. error.middleware reads err.statusCode + err.message and sends JSON

    isOperational marks expected/business errors (vs unexpected crashes).
*/
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
