/*
    Lightweight structured logger — no external deps.
    Emits one JSON line per event for easy grepping in the terminal.
*/
function emit(level, message, context = {}) {
    const entry = {
        ts: new Date().toISOString(),
        level,
        msg: message,
        ...context,
    };

    const line = JSON.stringify(entry);

    if (level === 'error') {
        console.error(line);
    } else if (level === 'warn') {
        console.warn(line);
    } else {
        console.log(line);
    }
}

const logger = {
    info(message, context) {
        emit('info', message, context);
    },
    warn(message, context) {
        emit('warn', message, context);
    },
    error(message, context) {
        emit('error', message, context);
    },
};

module.exports = logger;
