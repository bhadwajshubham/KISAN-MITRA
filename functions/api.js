const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Make sure this path is correct based on your folder structure
const apiRoutes = require('../../routes/api_router.js'); 

const app = express();

// --- Middleware ---
// ▼▼▼ THIS IS THE FIX ▼▼▼
// Apply the JSON body parser FIRST, with a generous limit
// for your base64 image data.
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- Use Your Router ---
// Tell the app to use your router file for all requests
// to this path.
app.use('/.netlify/functions/api', apiRoutes);

// --- Netlify Wrapper ---
module.exports.handler = serverless(app);