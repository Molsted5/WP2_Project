require('dotenv').config();
const express = require('express');
const path = require('path');
const { startSpaceFetchInterval } = require('./controllers/spaceStationController');
const connectDB = require('./config/dbConnection');
const { initWebSocket } = require('./config/webSocket');
const PORT = process.env.PORT || 3500;
const app = express();

async function startServer() {
    const db = await connectDB();

    // Attach db to each request
    app.use((req, res, next) => {
        req.db = db;
        next();
    });

    // Middleware
    app.use(express.json()); // enables express to parse incoming JSON data
    app.use(express.static(path.join(__dirname, 'client/build')));// serves as static and public accessible files

    // Routes
    app.use('/spaceStation', require('./routes/api/spaceStation'));

    // Catch-all for react to decide
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });

    startSpaceFetchInterval();
    
    // Start server
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Create WebSocket server
    const wss = initWebSocket(server);
}

startServer();
