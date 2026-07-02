// always follow the best practices for the server

// 1. Import packages
// 2. Load environment variables
// 3. Create Express app
// 4. Register middleware
// 5. Register routes
// 6. Start the server
// 7. Handle server errors

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Prep AI'});
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
    console.error('Error:', error);
});
