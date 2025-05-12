require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const http = require('http');
const routes = require('./routes/Route');

mongoose.set('strictQuery', true);

const app = express();

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'production url'
];
app.use(cors(allowedOrigins));

// Connect to Database
connectDB();

// Import routes
const authRoutes = require('./routes/auth.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});



// Create HTTP server
const server = http.createServer(app);

// Server Start
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});