// ==============================
// 🌾 MVP KISSAN MITRA — Netlify Diagnose Function (Production)
// ==============================

import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { image, language } = body;

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "No image provided." }),
      };
    }

    const match = image.match(/^data:(image\/.+);base64,(.*)$/);
    if (!match) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Invalid image format." }),
      };
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const prompt = `
You are an AI agronomist.
Analyze this crop image and respond ONLY in JSON:

{
  "issueName": "Leaf Spot",
  "issueType": "Fungal",
  "confidence": 0.87,
  "isHealthy": false,
  "description": "Short summary (1–2 lines).",
  "treatment": ["List short, actionable treatments."],
  "prevention": ["List simple prevention tips."],
  "diyTip": "One quick do-it-yourself tip."
}

Language: ${language || "en"}.
Do NOT include markdown or any extra text.
`;

    // ✅ Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imagePart = { inlineData: { data: base64Data, mimeType } };

    console.log("⚙️ Calling Gemini 2.0 Flash...");
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      parsed = {
        issueName: "Unknown",
        issueType: "Unidentified",
        confidence: 0.0,
        isHealthy: true,
        description: "Could not identify the issue clearly — retake the image.",
        treatment: [],
        prevention: [],
        diyTip: "Capture the affected area clearly in daylight.",
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: JSON.stringify(parsed) }),
    };
  } catch (error) {
    console.error("Diagnose Function Error:", error.message);
    return {
      statusCode: 502,
      body: JSON.stringify({
        success: false,
        error: `Gemini API Error: ${error.message}`,
      }),
    };
  }
};
