require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const os = require('os');

const app = express();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8080;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables.");
    process.exit(1); 
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully."))
    .catch((err) => {
        console.error("Failed to connect to MongoDB on startup:", err.message);
        process.exit(1); 
    });

mongoose.connection.on('error', err => {
    console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn("MongoDB connection lost.");
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/metrics', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = {
        0: 'Connection Lost',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting',
        99: 'Uninitialized'
    };

    try {
        const metrics = {
            uptime: process.uptime(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
            platform: os.platform(),
            cpus: os.cpus().length,
            database: stateMap[dbState] || 'Unknown'
        };
        res.status(200).json(metrics);
    } catch (error) {
        console.error('Metrics generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server bound to port ${PORT}`);
});