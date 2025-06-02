const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp();

const bucket = admin.storage().bucket(); // Uses default bucket

// Configure environment variables (set OPENAI_API_KEY via `firebase functions:config:set`)
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

function base64ToBuffer(base64) {
  return Buffer.from(base64, "base64");
}

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

// ✅ NEW: Upload audio to Firebase Storage and save Firestore doc
app.post("/uploadAudio", async (req, res) => {
  try {
    const { audioBase64, title, content, generatedBy, type } = req.body;

    if (!audioBase64 || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert base64 string back to buffer
    const buffer = Buffer.from(audioBase64, "base64");
    const fileName = `meditations/${title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    // Upload to Firebase Storage
    await file.save(buffer, {
      metadata: {
        contentType: "audio/mp3",
      },
    });

    // Make file publicly accessible (optional)
    await file.makePublic();

    // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      fileName
    )}?alt=media`;

    // Save metadata to Realtime Database
    const dbRef = admin.database().ref("meditations").push(); // Auto-generate a new key
    await dbRef.set({
      title,
      content,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy,
      type,
    });

    return res.status(200).json({
      message: "Upload successful",
      audioUrl: downloadUrl,
      dbKey: dbRef.key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
