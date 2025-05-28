const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

// Configure environment variables (set OPENAI_API_KEY via `firebase functions:config:set`)
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content ?? "No response";
    res.json({ response });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Chat failed", details: error.message });
  }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
