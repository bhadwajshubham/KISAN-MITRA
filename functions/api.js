const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// ▼▼▼ THIS IS THE FIX ▼▼▼
// The path is now './api/api_router.js' to point to the
// file inside the 'functions/api/' folder.
const apiRoutes = require('./api/api_router.js'); 

const app = express();

// --- Middleware ---
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- Use Your Router ---
app.use('/.netlify/functions/api', apiRoutes);

// --- Netlify Wrapper ---
module.exports.handler = serverless(app);