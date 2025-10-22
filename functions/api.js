const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();
const router = express.Router();

// --- Middleware ---
// This fixes the "Image data is required" error.
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- API Route ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required.' });
    }

    // Use the model name that works for you (e.g., gemini-1.5-flash-latest)
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
            const errorBody = await apiResponse.text();
            return res.status(502).json({ success: false, error: `Gemini API Error: ${errorBody}` });
        }

        const data = await apiResponse.json();
        const responseText = data.candidates[0].content.parts[0].text;
        res.json({ success: true, data: responseText });

    } catch (error) {
        res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
});

// --- Netlify Wrapper ---
app.use('/', router); // FIX: Use the root path, as Netlify handles the function path.
module.exports.handler = serverless(app);