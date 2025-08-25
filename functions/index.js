const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const axios = require("axios");

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

const MedTypesAndAffirmations = [
  {
    type: "Stress Relief",
    description:
      "Focus on helping the listener gently release physical and mental tension. Guide them through deep breathing, body scanning, and grounding visualisation.",
    affirmations: ["I am safe in this moment.", "I let go of what I can’t control.", "I allow myself to relax."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Loving & Kindness",
    description:
      "Guide the listener to cultivate warmth and goodwill toward themselves and others. Use gentle imagery and offer affirmations.",
    affirmations: ["May I be happy.", "May you be well.", "May we all feel love and peace."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Better Sleep",
    description:
      "Help the listener transition toward rest with slow, soft narration. Use breathwork, body relaxation, and fading visualisation.",
    affirmations: ["My body is ready for rest.", "I welcome calm and stillness.", "I release the day with ease."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Focus & Concentration",
    description:
      "Strengthen the listener’s mental clarity using breath anchoring and focused attention. Encourage stillness and returning to the present.",
    affirmations: ["I am focused and clear.", "My mind is steady.", "I return to the moment with ease."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Mindfulness",
    description:
      "Support the listener in being fully present. Guide them through breath and sensory awareness, with non-judgmental observation.",
    affirmations: ["I am here, now.", "I notice, without judgment.", "Each moment is enough."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Compassion",
    description: "Help the listener open their heart to others and themselves. Use gentle, empathetic language.",
    affirmations: ["I meet myself with kindness.", "I care deeply for others.", "Compassion flows through me."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Gratitude",
    description:
      "Encourage the listener to reflect on what they’re thankful for. Use grounding moments and warm imagery.",
    affirmations: ["I appreciate the small things.", "I am grateful for this moment.", "Gratitude fills my heart."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Anxiety Relief",
    description:
      "Gently guide the listener to calm anxious thoughts. Use breath control, grounding imagery, and reassurance.",
    affirmations: ["I am grounded and safe.", "This feeling will pass.", "I trust myself to handle this moment."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Resilience",
    description: "Empower the listener to connect with inner strength and calm. Use confident, reassuring language.",
    affirmations: ["I am stronger than I think.", "I can rise and begin again.", "I bend, but I do not break."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Relationships",
    description:
      "Guide the listener in reflecting on their connection with others. Encourage empathy and communication.",
    affirmations: [
      "I listen with an open heart.",
      "I bring presence to my relationships.",
      "I give and receive love freely.",
    ],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Anger",
    description:
      "Support the listener in recognising and soothing anger. Use grounding breath and emotional awareness.",
    affirmations: ["I am calm and centred.", "I respond with clarity, not reaction.", "I allow this feeling to pass."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
];

const PracticeTypes = [
  { name: "Vipassana", description: "Insight meditation from the Theravāda Buddhist tradition." },
  { name: "Zen (Zazen)", description: "Seated meditation from Japanese Zen Buddhism." },
  { name: "Tibetan (Dzogchen / Mahamudra)", description: "Non-dual awareness practices from Tibetan Buddhism." },
  {
    name: "Mindfulness-Based Stress Reduction (MBSR)",
    description: "Secularized mindfulness practice developed by Jon Kabat-Zinn.",
  },
  {
    name: "Transcendental Meditation (TM)",
    description: "Mantra-based, effortless meditation founded by Maharishi Mahesh Yogi.",
  },
  {
    name: "Yogic Meditation",
    description: "Rooted in Hindu traditions; includes breathwork, mantras, and chakra focus.",
  },
  { name: "Taoist Meditation", description: "Includes Qigong and internal energy cultivation from Taoist philosophy." },
  {
    name: "Secular Mindfulness Meditation",
    description: "Modern, clinical-style mindfulness, often adapted from Buddhism.",
  },
];

const mapDurationToWords = {
  MiniMed: { words: "350–380", breaks: 17, totalPauseTime: "40", duration: 1, description: "just for testing" },
  Reset: {
    words: "550–600",
    breaks: 19,
    totalPauseTime: "70",
    duration: 4,
    description:
      "Approximately 5 minutes - Perfect for a mind-reset between meetings or to get yourself focused before a big event",
  },
  Timeout: {
    words: "900–950",
    breaks: 28,
    totalPauseTime: "90",
    duration: 8,
    description: "Enough to forget the business surrounding you and return to your safe space.",
  },
  // Relax: {
  //   words: "1100–1150",
  //   breaks: 35,
  //   totalPauseTime: "100",
  //   duration: 12,
  //   description: "Change gear completely. Perfect wind-down at the end of the day",
  // },
  // 15: { words: 1900, breaks: 55 },
};

const generateAIScript = async (meditationType, duration, practiceType) => {
  console.log(meditationType, duration, practiceType);
  console.log("generating script");

  const details = MedTypesAndAffirmations.find((m) => m.type === meditationType);
  const type = PracticeTypes.find((p) => p.name === practiceType);
  const wordsAndBreaks = mapDurationToWords[duration];

  const prompt = `You are a skilled meditation script writer. Write a calming, natural-sounding guided meditation script in English (UK) that matches the following parameters:
  • Meditation Type: ${meditationType} for ${type?.name} - ${type?.description}
  • Overview: ${details?.description}
  • Tone: Warm, gentle, and soothing  
  • Duration: ${wordsAndBreaks.duration} minutes (~${wordsAndBreaks.words} words)  
  • Insert ${wordsAndBreaks.breaks} natural breaks <break time='X.Xs'/>
  • Include affirmations: ${details?.affirmations.join(", ")}
  Only output the final meditation script, formatted as plain text with <break> tags each in its own paragraph.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Please generate a ${duration}-minute ${meditationType} meditation` },
      ],
      temperature: 0.7,
    },
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );

  const content = response.data.choices[0].message.content.trim();

  return { title: `${meditationType} Meditation`, content };
};

// const generateAIAudio = async (rawText, voiceCode = "en-GB-BellaNeural") => {
//   console.log("generating audio");
//   const key = process.env.AZURE_TTS_KEY;
//   const region = "uksouth";

//   const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
//   const ssml = `
//     <speak version="1.0" xml:lang="en-US"
//       xmlns:mstts="https://www.w3.org/2001/mstts">
//       <voice name="${voiceCode}">
//         <mstts:express-as style="calm" styledegree="1.2">
//           ${rawText}
//         </mstts:express-as>
//       </voice>
//     </speak>`;

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Ocp-Apim-Subscription-Key": key,
//       "Content-Type": "application/ssml+xml",
//       "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
//     },
//     body: ssml,
//   });

//   if (!response.ok) {
//     throw new Error("Azure TTS failed: " + (await response.text()));
//   }

//   // ✅ Return Node Buffer directly
//   const arrayBuffer = await response.arrayBuffer();
//   return Buffer.from(arrayBuffer);
// };

function splitTextByLimit(text, limit = 9000) {
  const chunks = [];
  let current = "";

  for (const sentence of text.split(/(\.|\?|!|\n)/)) {
    if ((current + sentence).length > limit) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current);

  return chunks;
}

const generateAIAudio = async (rawText, voiceCode = "en-GB-SoniaNeural") => {
  console.log("generating audio");
  const key = process.env.AZURE_TTS_KEY;
  const region = "uksouth";
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  // Split raw text into chunks under 10k chars (including SSML tags)
  const textChunks = splitTextByLimit(rawText, 9000); // leave room for SSML wrapper

  const buffers = [];

  for (const chunk of textChunks) {
    const ssml = `
      <speak version="1.0" xml:lang="en-US"
        xmlns:mstts="https://www.w3.org/2001/mstts">
        <voice name="${voiceCode}">
          <mstts:express-as style="calm" styledegree="1.4">
            ${chunk}
          </mstts:express-as>
        </voice>
      </speak>`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    });

    if (!response.ok) {
      throw new Error("Azure TTS failed: " + (await response.text()));
    }

    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
  }

  // Concatenate all chunks into one Buffer
  return Buffer.concat(buffers);
};

app.post("/generateMeditation", async (req, res) => {
  try {
    console.log("endpoint hit");

    const { meditationType, practiceType, duration, voiceCode, language, userId } = req.body;

    // Generate script
    const script = await generateAIScript(meditationType, duration, practiceType);

    // Generate audio as Buffer
    const buffer = await generateAIAudio(script.content, voiceCode);

    // --- Save audio file to Storage ---
    const fileName = `meditations/${script.title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: { contentType: "audio/mpeg" }, // ✅ Safari prefers this
    });

    // Generate signed URL (works in Safari)
    const [downloadUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // basically "never expires"
    });

    console.log("SAVING", {
      title: script.title,
      content: script.content,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy: userId,
      type: meditationType,
      language,
      style: practiceType,
      voiceCode,
    });
    // Save metadata to Realtime DB
    const dbRef = admin.database().ref("meditations").push();
    await dbRef.set({
      title: script.title,
      content: script.content,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy: userId,
      type: meditationType,
      language,
      style: practiceType,
      voiceCode,
    });

    console.log("saved");

    return res.status(200).json({
      message: "Upload successful",
      audioUrl: downloadUrl,
      dbKey: dbRef.key,
      script,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

app.post("/generateStaticMeditation", async (req, res) => {
  try {
    console.log("endpoint hit");

    const { voiceCode, script, title, generatedBy, type, style } = req.body;

    // Generate audio as Buffer
    const buffer = await generateAIAudio(script, voiceCode);

    // Save audio to Firebase Storage
    const fileName = `meditations/${title.replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: "audio/mpeg", // ✅ standard MIME type for MP3
      },
    });

    await file.makePublic();

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      fileName
    )}?alt=media`;

    console.log("SAVING", {
      title,
      content: script,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy,
      type,
      style,
      staticMed: true,
      verified: false,
      voiceCode,
    });
    // Save metadata to Realtime DB
    const dbRef = admin.database().ref("meditations-static").push();
    await dbRef.set({
      title,
      content: script,
      audioUrl: downloadUrl,
      createdAt: Date.now(),
      generatedBy,
      type,
      style,
      staticMed: true,
      verified: false,
      voiceCode,
    });

    console.log("saved");

    return res.status(200).json({
      message: "Upload successful",
      audioUrl: downloadUrl,
      dbKey: dbRef.key,
      script,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

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
