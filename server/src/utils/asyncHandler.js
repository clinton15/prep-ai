/*
    Wraps async route handlers so rejected promises are forwarded to
    the global error middleware via next(err).

    Without this, an unhandled await rejection can crash the process
    or leave the request hanging.

    Usage:
        const getUser = asyncHandler(async (req, res) => { ... });

    Flow on error:
        throw / rejected promise → .catch(next) → error.middleware
*/
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
