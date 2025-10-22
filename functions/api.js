const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// ▼▼▼ THIS IS THE FIX ▼▼▼
// The path is now '../' to go from 'functions/' up to the root,
// and then down into 'routes/'.
const apiRoutes = require('../routes/api_router.js'); 

const app = express();

// --- Middleware ---
// Apply the JSON body parser FIRST
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- Use Your Router ---
app.use('/.netlify/functions/api', apiRoutes);

// --- Netlify Wrapper ---
module.exports.handler = serverless(app);