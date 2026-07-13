const ApiError = require('../utils/ApiError');

/*
    Generic Zod validation middleware factories.

    validate(schema)       → req.body
    validateQuery(schema)  → req.query
    validateParams(schema) → req.params
*/
function createValidator(source) {
    return (schema) => (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const message =
                result.error.issues[0]?.message || 'Validation failed';
            return next(
                new ApiError(400, message, 'VALIDATION_ERROR')
            );
        }

        req[source] = result.data;
        next();
    };
}

const validate = createValidator('body');
const validateQuery = createValidator('query');
const validateParams = createValidator('params');

module.exports = validate;
module.exports.validateQuery = validateQuery;
module.exports.validateParams = validateParams;
