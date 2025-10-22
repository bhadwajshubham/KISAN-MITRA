// functions/api/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

// Import the official Google AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const router = express.Router();

app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// Initialize the Google AI Client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

router.post('/diagnose', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured.' });
    }
    const { image, language } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Image data is required.' });
    }
    const prompt = `Analyze this crop image...`; // Your full prompt

    try {
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const imagePart = {
            inlineData: { data: image.split(',')[1], mimeType: "image/jpeg" },
        };
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        res.json({ success: true, data: text });
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);