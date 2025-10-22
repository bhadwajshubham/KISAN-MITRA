const serverless = require('serverless-http');
const app = require('./api_app'); // Import the configured app

// This is your Netlify handler
module.exports.handler = serverless(app);
