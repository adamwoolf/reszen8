import React, { useState } from "react";
import { generateScript } from "../services/aiMeditationService";

const ScriptLab = ({
  meditationType,
  duration,
  selectedLanguage,
  practiceType,
}: {
  meditationType: string;
  duration: string;
  selectedLanguage: string;
  practiceType: { name: string; description: string };
}) => {
  const [script, setScript] = useState({ content: "" });
  const [generating, setGenerating] = useState(false);

  const getScript = async () => {
    setScript("");
    setGenerating(true);
    const res = await generateScript(meditationType, duration, selectedLanguage, practiceType);
    setScript(res);
    setGenerating(false);
  };

  const formattedScript = () => {
    return script?.content.split("/>");
  };
  console.log(script);

  //  TTS practise

  async function speakText(rawText = "Hello, my name is Adam") {
    const key = "6dpVCv7YxSWTEqzpgzVUnJyj4VVgpgXWkw9RznugKswUUdxkhF0oJQQJ99BHACmepeSXJ3w3AAAYACOGxBNG";
    // ⚠️ For testing only! In production, call your backend instead of exposing the key.
    const subscriptionKey = "YOUR_AZURE_TTS_KEY";
    const region = "uksouth"; // e.g. "eastus"
    const endpoint = "https://uksouth.api.cognitive.microsoft.com/";

    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const text = String(rawText);

    // Wrap text in SSML for better control
    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-GB-OllieMultilingualNeural">
         ${text}
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

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();

    // const link = document.createElement("a");
    // link.href = audioUrl;
    // link.download = "test_with_OllieMultilingualNatural_shorter-breaks.mp3";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  }

  if (generating) return <div>Generating Script - please wait...</div>;

  const testScript = `
  Welcome to this mini med meditation for Stress Relief.
<break time="2.15s" />
Today, we’ll explore through the practice of Vipassana.
<break time="2.0s" />
Find a comfortable position, close your eyes if you wish, and allow yourself to arrive fully in this moment.
<break time="1.95s" />

Allow stillness to spread through you, bringing a quiet sense of balance.
<break time="1.8s" />

Offer yourself kindness with the thought: may I be peaceful, may I be at ease.
<break time="1.4s" />

Mindfulness-Based Stress Reduction reminds us to return, again and again, to the breath.
<break time="2.05s" />

Taoist meditation connects us with natural rhythms, aligning with flow and balance.
<break time="1.5s" />

Allow stillness to spread through you, bringing a quiet sense of balance.
<break time="1.55s" />

Taoist meditation connects us with natural rhythms, aligning with flow and balance.
<break time="1.75s" />

Notice the sensations in your body without trying to change them, simply observing.
<break time="1.3s" />

Zen invites us to rest in simplicity, just sitting, just breathing.
<break time="2.35s" />

Remind yourself: it is enough simply to be in this moment.
<break time="1.9s" />

Bring attention to the present moment, free from the weight of the past or the pull of the future.
<break time="1.95s" />

Allow stillness to spread through you, bringing a quiet sense of balance.
<break time="1.45s" />

Zen invites us to rest in simplicity, just sitting, just breathing.
<break time="1.95s" />

Picture yourself walking through a peaceful forest, sunlight filtering softly through the trees.
<break time="1.65s" />

Offer yourself kindness with the thought: may I be peaceful, may I be at ease.
<break time="1.85s" />

With each inhale, imagine filling your body with calm. With each exhale, release what no longer serves you.
<break time="1.45s" />

Visualize a soft, glowing light at the center of your chest, expanding with every breath.
<break time="1.6s" />

Feel the cool air as you inhale, and the warmth as you exhale.
<break time="2.4s" />

In Vipassana, we observe sensations as they are, with equanimity.
<break time="1.35s" />

Bring attention to the present moment, free from the weight of the past or the pull of the future.
<break time="1.65s" />

Bring attention to the present moment, free from the weight of the past or the pull of the future.
<break time="2.35s" />

In Yogic meditation, prana flows freely as the body softens into stillness.
<break time="1.9s" />

Visualize a soft, glowing light at the center of your chest, expanding with every breath.
<break time="1.65s" />

Secular mindfulness reminds us that awareness itself is enough, here and now.
<break time="1.75s" />

Notice how your body feels supported, grounded, and safe in this moment.
<break time="1.6s" />

In Vipassana, we observe sensations as they are, with equanimity.
<break time="2.1s" />

Notice your breath moving gently in and out, steady and calm.
<break time="2.3s" />

See yourself seated high on a mountain, surrounded by vast open sky.
<break time="2.5s" />

As this minimed meditation comes to a close, gently return your awareness to the space around you.
<break time="1.85s" />
Carry this sense of stress relief with you as you move forward with your day.
<break time="1.55s" />
When you are ready, open your eyes and rejoin the world, refreshed and centered.
<break time="1.45s" />
    `;

  return (
    <div>
      <button onClick={() => speakText(testScript)}>Speak Text</button>
      {/* <button style={{ marginBottom: 40 }} onClick={getScript}>
        Return Script (test btn)
      </button>
      {script && <h3>{meditationType}</h3>}
      {formattedScript().map((p, i) => (
        <p key={i}>{`${p}`}</p>
      ))} */}
    </div>
  );
};

export default ScriptLab;
