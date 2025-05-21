const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const jobsRoutes = require('./jobs.routes');
const chatRoutes = require('./chat.routes');

// Initialize routes
router.use('/api/auth', authRoutes);
router.use('/api/jobs', jobsRoutes);
router.use('/api/chat', chatRoutes);

module.exports = router;