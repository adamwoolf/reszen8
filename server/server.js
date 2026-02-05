// server.js
import express from "express";
import fetch from "node-fetch"; // or use native fetch if Node >= 18

const app = express();
const PORT = process.env.PORT || 3000;

// Your Vimeo personal access token
const VIMEO_ACCESS_TOKEN = "d1a6be3bac13809016eeae501f79ee1e";

if (!VIMEO_ACCESS_TOKEN) {
  console.error("❌ Please set the VIMEO_ACCESS_TOKEN environment variable!");
  process.exit(1);
}

// Endpoint to get your videos
app.get("/videos", async (req, res) => {
  try {
    const response = await fetch("https://api.vimeo.com/me/videos", {
      headers: {
        Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
