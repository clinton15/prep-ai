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
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const interviewProcessRoutes = require('./routes/interviewProcess.routes');
const interviewRoundRoutes = require('./routes/interviewRound.routes');
const questionRoutes = require('./routes/interviewQuestion.routes');
const answerRoutes = require('./routes/interviewAnswer.routes');

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/processes', interviewProcessRoutes);
app.use('/api/rounds', interviewRoundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Prep AI' });
});

const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
        console.error('Error:', error);
    });
}

startServer();
