/*
    Custom error class used across controllers and middleware.

    Flow:
    1. Controller / middleware throws: throw new ApiError(404, 'Not found', 'NOT_FOUND')
    2. asyncHandler catches it and calls next(err)
    3. error.middleware reads statusCode, message, code and sends JSON
*/
class ApiError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code || ApiError.codeFromStatus(statusCode);
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static codeFromStatus(statusCode) {
        switch (statusCode) {
            case 400:
                return 'VALIDATION_ERROR';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            case 429:
                return 'RATE_LIMITED';
            case 502:
            case 503:
                return 'AI_UNAVAILABLE';
            default:
                return statusCode >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR';
        }
    }
}

module.exports = ApiError;
