const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    // req.body will now work because of the fix in api.js
    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Analyze this crop image...`; // Your prompt

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                // ▼▼▼ THIS IS THE SECOND FIX ▼▼▼
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
            console.error(`Gemini API Error: ${errorBody}`);
            return res.status(502).json({ success: false, error: `Gemini API Error: ${errorBody}` });
        }

        const data = await apiResponse.json();
        const responseText = data.candidates[0].content.parts[0].text;
        res.json({ success: true, data: responseText });

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
});

module.exports = router;