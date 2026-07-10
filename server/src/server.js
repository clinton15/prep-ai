// always follow the best practices for the server

// 1. Import packages
// 2. Load environment variables
// 3. Create Express app
// 4. Register middleware
// 5. Register routes
// 6. Start the server
// 7. Handle server errors

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const interviewProcessRoutes = require('./routes/interviewProcess.routes');
const interviewRoundRoutes = require('./routes/interviewRound.routes');
const questionRoutes = require('./routes/interviewQuestion.routes');
const answerRoutes = require('./routes/interviewAnswer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

const PORT = process.env.PORT || 8080;

/*
    Request flow (top → bottom):

    1. helmet        → sets secure HTTP headers
    2. express.json  → parses JSON request bodies
    3. routes        → auth, validation, rate limits, controllers
    4. errorMiddleware → catches thrown/forwarded errors (must be last)
*/
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/processes', interviewProcessRoutes);
app.use('/api/rounds', interviewRoundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Prep AI' });
});

// Global error handler — Express only treats this as error middleware
// when it has 4 args (err, req, res, next). Keep it after all routes.
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
