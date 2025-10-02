require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConnection');
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
    app.use(cors(corsOptions)); // cross origin resource sharing. Helps during development, because frontend and backend might run on different localhost, if frameworks like react or angular are used
    app.use(express.urlencoded({ extended: false })); // enables express to parse URL-encoded form data
    app.use(express.json()); // enables express to parse incoming JSON data
    //app.use(express.static(path.join(__dirname, '/public'))); // serves static and public accessible files

    // Routes
    //app.use('/', require('./routes/index'));
    app.use('/employees', require('./routes/api/employees'));

    // app.all('/*', (req, res) => {
    //     res.status(404);
    //     if (req.accepts('html')) {
    //         res.sendFile(path.join(__dirname, 'views', '404.html'));
    //     } else if (req.accepts('json')) {
    //         res.json({ error: "404 Not Found" });
    //     } else {
    //         res.type('txt').send("404 Not Found");
    //     }
    // });

    // Start server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
