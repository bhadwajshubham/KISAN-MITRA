const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

// Import the official Google AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const router = express.Router();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ▼▼▼ THIS IS THE FIX ▼▼▼
// Explicitly set the API version to 'v1'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY, { apiVersion: 'v1' });
// ▲▲▲ THIS IS THE FIX ▲▲▲

router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required.' });
    }

    const prompt = `Analyze this crop image. Respond ONLY with a single, minified JSON object with these keys: "isHealthy" (boolean), "issueName" (string), "issueType" (string, "Disease" or "Pest"), "confidence" (number between 0.0 and 1.0), "description" (string, max ONE sentence), "treatment" (array of short, actionable strings, like a recipe), "prevention" (array of short, actionable strings), "diyTip" (string, a single, practical DIY tip). All string values must be in ${language}.`;

    try {
        // Keep using gemini-pro-vision, which should work with API v1
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const imagePart = {
            inlineData: {
                data: image.split(',')[1],
                mimeType: "image/jpeg"
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, data: text });

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
});

// Netlify Wrapper
app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);