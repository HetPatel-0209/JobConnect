const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

// Handle preflight OPTIONS requests for CORS
router.options('/login', (req, res) => {
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
});

// Login route
router.post('/login', login);

module.exports = router;