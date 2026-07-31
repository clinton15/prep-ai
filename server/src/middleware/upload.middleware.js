const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { ALLOWED_RESUME_MIMES } = require('../utils/extractResumeText');

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_RESUME_BYTES },
    fileFilter(req, file, cb) {
        if (!ALLOWED_RESUME_MIMES.has(file.mimetype)) {
            cb(
                new ApiError(
                    400,
                    'Resume must be a PDF or DOCX file'
                )
            );
            return;
        }
        cb(null, true);
    },
});

/** Single-file resume upload field name: `resume` */
const uploadResume = resumeUpload.single('resume');

/**
 * Wrap multer so size/type errors become ApiErrors for the global handler.
 */
function handleResumeUpload(req, res, next) {
    uploadResume(req, res, (err) => {
        if (!err) {
            next();
            return;
        }

        if (err instanceof ApiError) {
            next(err);
            return;
        }

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                next(
                    new ApiError(
                        400,
                        'Resume file must be 5MB or smaller'
                    )
                );
                return;
            }
            next(new ApiError(400, err.message || 'File upload failed'));
            return;
        }

        next(err);
    });
}

module.exports = {
    handleResumeUpload,
    MAX_RESUME_BYTES,
};
