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
const ApiError = require('./utils/ApiError');

const app = express();

const PORT = process.env.PORT || 8080;

// Browser Origin never has a trailing slash — normalize CLIENT_URL
const clientOrigin = (process.env.CLIENT_URL || '')
    .trim()
    .replace(/\/+$/, '');

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
    cors({
        origin: clientOrigin || false,
        credentials: true,
    })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

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
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
        console.error('Error:', error);
    });
};

startServer();
