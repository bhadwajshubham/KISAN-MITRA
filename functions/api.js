const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// ▼▼▼ THIS IS THE FIX ▼▼▼
// The path is now './api_router.js' because both files
// are in the same folder, and Netlify is looking in this folder.
const apiRoutes = require('./api_router.js'); 

const app = express();

// --- Middleware ---
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- Use Your Router ---
app.use('/.netlify/functions/api', apiRoutes);

// --- Netlify Wrapper ---
module.exports.handler = serverless(app);