/*
    Global Express error middleware (4-argument signature).

    Receives errors from:
    - asyncHandler (.catch(next))
    - validate middleware (next(new ApiError(...)))
    - any next(err) call

    Response shape stays consistent: { message }
    Stack traces are only included when NODE_ENV === 'development'.
*/
const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    const response = { message };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    console.error(err);

    return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
