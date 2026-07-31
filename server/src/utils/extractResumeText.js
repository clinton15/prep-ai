const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('./ApiError');

const PDF_MIME = 'application/pdf';
const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const ALLOWED_RESUME_MIMES = new Set([PDF_MIME, DOCX_MIME]);

async function extractTextFromPdf(buffer) {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return (result?.text || '').trim();
    } finally {
        await parser.destroy().catch(() => {});
    }
}

async function extractTextFromDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
}

/**
 * Extract plain text from an uploaded resume buffer.
 * Does not persist the file — caller discards the buffer after use.
 */
async function extractResumeText(file) {
    if (!file?.buffer) {
        throw new ApiError(400, 'Resume file is required');
    }

    const mime = file.mimetype;
    if (!ALLOWED_RESUME_MIMES.has(mime)) {
        throw new ApiError(
            400,
            'Resume must be a PDF or DOCX file'
        );
    }

    let text = '';

    try {
        if (mime === PDF_MIME) {
            text = await extractTextFromPdf(file.buffer);
        } else {
            text = await extractTextFromDocx(file.buffer);
        }
    } catch (error) {
        console.error('[resume] Parse failed:', error);
        throw new ApiError(
            422,
            'Could not extract text from that file. Try a text-based PDF or DOCX.'
        );
    }

    if (!text) {
        throw new ApiError(
            422,
            'No extractable text found. Scanned/image-only PDFs are not supported — paste your resume text instead.'
        );
    }

    return text;
}

module.exports = {
    ALLOWED_RESUME_MIMES,
    PDF_MIME,
    DOCX_MIME,
    extractResumeText,
};
