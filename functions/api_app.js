const express = require('express');
const cors = require('cors');
const router = require('./api_router'); // We will create this file next

const app = express();

// Apply middleware
app.use(cors());
// The JSON parsing middleware is now in local_server.js, so we remove it from here
// to avoid conflicts and ensure it's applied correctly in the local environment.
// app.use(express.json({ limit: '10mb' }));

// Use the router
app.use('/.netlify/functions/api', router);

module.exports = app; // Export the configured app
