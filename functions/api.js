// New libraries for Netlify
const express = require('express');
const serverless = require('serverless-http');

// Your existing required libraries
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// New Express app and router for Netlify
const app = express();
const router = express.Router();

// Your Middleware (No changes needed)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Note: The 'express.static' line is not needed here as Netlify handles this separately.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Your API endpoint, but using 'router' instead of 'app'
router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key server par configure nahi hai. .env file check karein.' });
    }

    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data zaroori hai.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Analyze this crop image. Respond ONLY with a single, minified JSON object with these keys: "isHealthy" (boolean), "issueName" (string), "issueType" (string, "Disease" or "Pest"), "confidence" (number between 0.0 and 1.0), "description" (string, max ONE sentence), "treatment" (array of short, actionable strings, like a recipe), "prevention" (array of short, actionable strings), "diyTip" (string, a single, practical DIY tip). All string values must be in ${language}.`;

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                { inlineData: { mime_type: "image/jpeg", data: image.split(',')[1] } }
            ]
        }]
    };

    try {
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            throw new Error(errorBody.error.message);
        }

        const data = await apiResponse.json();
        const responseText = data.candidates[0].content.parts[0].text;
        res.json({ success: true, data: responseText });

    } catch (error) {
        console.error("Gemini API ko call karte waqt error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// New Netlify wrapper code
app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);

// NOTICE: We have removed the app.listen(...) part.
// Netlify handles starting the server, so that part is not needed.