const logger = require('../utils/logger');

/*
    Logs each finished request with timing and (when available) user id.
    Place early in the middleware stack; userId is filled after auth runs.
*/
function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        logger.info('http.request', {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            userId: req.user?._id?.toString() || null,
        });
    });

    next();
}

module.exports = requestLogger;
