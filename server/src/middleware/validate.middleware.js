const ApiError = require('../utils/ApiError');

/*
    Generic Zod validation middleware factory.

    Usage on a route:
        router.post('/', validate(createSchema), controller)

    Flow:
    1. safeParse(req.body) against the provided Zod schema
    2. On failure → next(ApiError 400) → global error middleware
    3. On success → replace req.body with parsed/coerced data, then next()

    Only validates request body (not params/query).
    Business rules (ownership, duplicates, DB existence) stay in controllers.
*/
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const message =
            result.error.issues[0]?.message || 'Validation failed';
        return next(new ApiError(400, message));
    }

    // Use Zod's output (trimmed strings, defaults, coerced dates, etc.)
    req.body = result.data;
    next();
};

module.exports = validate;
