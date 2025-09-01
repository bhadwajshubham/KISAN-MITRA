const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API endpoint using the router
router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        console.error("ERROR - API Key is missing on the server!");
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required.' });
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
            const errorBody = await apiResponse.text();
            console.error("ERROR from Gemini API:", errorBody);
            throw new Error(`Gemini API Error: ${errorBody}`);
        }

        const data = await apiResponse.json();
        const responseText = data.candidates[0].content.parts[0].text;
        res.json({ success: true, data: responseText });

    } catch (error) {
        console.error("FATAL ERROR in catch block:", error.message);
        res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
});

// Netlify wrapper
app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);