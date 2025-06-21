const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobsRoutes = require('./jobs.routes');
const chatRoutes = require('./chat.routes');
const organizationRoutes = require('./organization.routes');

router.use('/api/auth', authRoutes);
router.use('/api/jobs', jobsRoutes);
router.use('/api/chat', chatRoutes);
router.use('/api/organizations', organizationRoutes);

// Root route for API health check
router.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'JobConnect API is running',
    timestamp: new Date()
  });
});

module.exports = router;