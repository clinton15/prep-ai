const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../src/utils/ApiError');
const logger = require('../src/utils/logger');

let ai;

const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 45_000;
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES) || 2; // retries after first attempt
const BASE_BACKOFF_MS = Number(process.env.GEMINI_BACKOFF_MS) || 800;

function getAI() {
    if (!ai) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new ApiError(
                500,
                'AI is not configured (missing GEMINI_API_KEY)',
                'INTERNAL_ERROR'
            );
        }

        ai = new GoogleGenAI({ apiKey });
    }

    return ai;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error) {
    if (error?.name === 'AbortError') return true;

    const status = error?.status ?? error?.statusCode ?? error?.code;
    if ([408, 429, 500, 502, 503, 504].includes(Number(status))) {
        return true;
    }

    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('timeout') ||
        message.includes('timed out') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('fetch failed') ||
        message.includes('network') ||
        message.includes('unavailable') ||
        message.includes('overloaded')
    );
}

function withTimeout(promise, ms, operation) {
    let timer;

    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            const err = new Error(`Gemini ${operation} timed out after ${ms}ms`);
            err.name = 'AbortError';
            err.statusCode = 408;
            reject(err);
        }, ms);
    });

    return Promise.race([promise, timeout]).finally(() => {
        clearTimeout(timer);
    });
}

function parseJsonResponse(text, operation) {
    if (!text || !String(text).trim()) {
        throw new ApiError(
            502,
            `AI returned an empty response while handling ${operation}. Please try again.`,
            'AI_UNAVAILABLE'
        );
    }

    try {
        return JSON.parse(text);
    } catch (parseError) {
        logger.warn('gemini.json_parse_failed', {
            operation,
            preview: String(text).slice(0, 200),
            error: parseError.message,
        });

        throw new ApiError(
            502,
            `AI returned an invalid response while handling ${operation}. Please try again.`,
            'AI_UNAVAILABLE'
        );
    }
}

async function callGeminiOnce(prompt, operation) {
    const model = process.env.GEMINI_MODEL;

    const response = await withTimeout(
        getAI().models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        }),
        TIMEOUT_MS,
        operation
    );

    return parseJsonResponse(response?.text, operation);
}

/**
 * Central Gemini caller: timeout, retries with backoff, safe JSON parse.
 * Throws ApiError(502, …, 'AI_UNAVAILABLE') after retries are exhausted.
 */
async function generateJson(prompt, { operation = 'request' } = {}) {
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        try {
            logger.info('gemini.attempt', {
                operation,
                attempt: attempt + 1,
                maxAttempts: MAX_RETRIES + 1,
            });

            const data = await callGeminiOnce(prompt, operation);

            logger.info('gemini.success', {
                operation,
                attempt: attempt + 1,
            });

            return data;
        } catch (error) {
            lastError = error;

            // Operational ApiErrors from parse/config — retry once only for empty/invalid JSON
            const isParseOrEmpty =
                error instanceof ApiError &&
                error.code === 'AI_UNAVAILABLE' &&
                /empty|invalid/i.test(error.message);

            const canRetry =
                attempt < MAX_RETRIES &&
                (isTransientError(error) || isParseOrEmpty);

            logger.warn('gemini.failure', {
                operation,
                attempt: attempt + 1,
                willRetry: canRetry,
                error: error.message,
                code: error.code || error.statusCode || null,
            });

            if (!canRetry) {
                break;
            }

            const delay = BASE_BACKOFF_MS * 2 ** attempt;
            await sleep(delay);
        }
    }

    if (lastError instanceof ApiError) {
        throw lastError;
    }

    logger.error('gemini.exhausted', {
        operation,
        error: lastError?.message,
    });

    throw new ApiError(
        502,
        `AI is temporarily unavailable while handling ${operation}. Please try again.`,
        'AI_UNAVAILABLE'
    );
}

module.exports = {
    generateJson,
    TIMEOUT_MS,
    MAX_RETRIES,
};
