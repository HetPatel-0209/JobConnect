const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

// Initialize routes
router.use('/api/auth', authRoutes);

module.exports = router;