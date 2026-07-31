require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const interviewProcessRoutes = require('./routes/interviewProcess.routes');
const interviewRoundRoutes = require('./routes/interviewRound.routes');
const questionRoutes = require('./routes/interviewQuestion.routes');
const answerRoutes = require('./routes/interviewAnswer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorMiddleware = require('./middleware/error.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

const app = express();

const PORT = process.env.PORT || 8080;

// Browser Origin never has a trailing slash — normalize CLIENT_URL
const clientOrigin = (process.env.CLIENT_URL || '')
    .trim()
    .replace(/\/+$/, '');

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Helmet is a middleware that helps to secure the app by setting various HTTP headers
//eg. it helps to prevent XSS attacks by setting the X-XSS-Protection header to 1; mode=block
//It helps to prevent Clickjacking attacks by setting the X-Frame-Options header to SAMEORIGIN
//It helps to prevent MIME type sniffing by setting the X-Content-Type-Options header to nosniff
//It helps to prevent cross-site scripting (XSS) attacks by setting the Content-Security-Policy header
//It helps to prevent cross-site request forgery (CSRF) attacks by setting the X-CSRF-Token header
//It helps to prevent cross-site scripting (XSS) attacks by setting the X-XSS-Protection header to 1; mode=block
//It helps to prevent cross-site request forgery (CSRF) attacks by setting the X-CSRF-Token header
app.use(helmet());
app.use(
    cors({
        origin: clientOrigin || false,
        credentials: true,
    })
);
// express.json is a middleware that parses the incoming request body in a JSON format without which we won't be able to parse the request body
app.use(express.json({ limit: '1mb' }));
// cookieParser is a middleware that parses the incoming request cookies in a JSON format without which we won't be able to parse the request cookies
//it is used to parse the cookies attached to the request
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/processes', interviewProcessRoutes);
app.use('/api/rounds', interviewRoundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hello from Prep AI',
    });
});

// Unmatched routes
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
});

app.use(errorMiddleware);

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        logger.info('server.started', { port: PORT, env: process.env.NODE_ENV });
    });

    server.on('error', (error) => {
        logger.error('server.error', { error: error.message });
    });
};

startServer();
