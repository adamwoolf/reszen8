const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Initialize Firebase Admin
admin.initializeApp();

const bucket = admin.storage().bucket(); // Uses default bucket

// ✅ Use environment variable from .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

// ✅ Upload audio endpoint
app.post("/uploadAudio", async (req, res) => {
  try {
    const { audioBase64, title, content, generatedBy, voiceCode, style, type, language } = req.body;
    console.log(req.body);
    if (!audioBase64 || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const buffer = Buffer.from(audioBase64, "base64");
    const fileName = `meditations/${title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: "audio/mp3",
      },
    });

    await file.makePublic();

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      fileName
    )}?alt=media`;

    const dbRef = admin.database().ref("meditations").push();
    await dbRef.set({
      title,
      content,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy,
      type,
      language,
      style,
      voiceCode,
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

app.post("/uploadStaticAudio", async (req, res) => {
  try {
    const { audioBase64, title, content, generatedBy, voiceCode, style, type, language } = req.body;

    if (!audioBase64 || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const buffer = Buffer.from(audioBase64, "base64");
    const fileName = `meditations/${title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: "audio/mp3",
      },
    });

    await file.makePublic();

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      fileName
    )}?alt=media`;

    const dbRef = admin.database().ref("meditations-static").push();
    await dbRef.set({
      title,
      content,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy,
      type,
      style,
      staticMed: true,
      verified: false,
      voiceCode,
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

// ✅ sendMail as V2 function
exports.sendMail = onRequest((req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  res.set("Access-Control-Allow-Origin", "*");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "connect@reszen8.com",
      pass: "jqsvxbqvsdxljuba", // ⚠️ Should move to environment variable
    },
  });

  const { html, subject, to: recipient, cc } = req.body;

  const from = "RESZEN8 <connect@reszen8.com>";

  const mailOptions = {
    from,
    to: recipient,
    bcc: cc,
    subject,
    html: `<div>${html}</div>`,
  };

  console.log("Sending email to", recipient);

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email error:", err);
      return res.status(500).send(err.toString());
    }
    console.log("Email sent:", info.response);
    return res.status(200).send("Sent");
  });
});

// ✅ Export Express app as a V2 HTTPS function
exports.api = onRequest(app);
