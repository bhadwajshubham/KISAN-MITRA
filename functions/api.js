const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

// ▼▼▼ FIX 1: Import the official Google AI SDK ▼▼▼
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const router = express.Router();

app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// ▼▼▼ FIX 2: Initialize the Google AI Client ▼▼▼
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
        // ▼▼▼ FIX 3: Use the SDK to make the API call ▼▼▼

        // 1. Get the model
        // (Use the model name that worked for you, e.g., gemini-1.5-flash-latest)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-latest" });

        // 2. Prepare the image data in the format the SDK expects
        const imagePart = {
            inlineData: {
                data: image.split(',')[1],
                mimeType: "image/jpeg" 
            },
        };

        // 3. Generate the content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Send the successful response
        res.json({ success: true, data: text });

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);