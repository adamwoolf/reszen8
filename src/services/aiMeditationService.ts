import axios from "axios";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "./helpers";
import { v4 as uuidv4 } from "uuid";

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
  downloadLink?: string;
  audioBlob?: Blob;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
  downloadLink?: string;
  audioBlob?: Blob;
}

// ---------- Azure TTS ----------
export const generateAudio = async (rawText: string, voiceCode = "en-GB-OllieMultilingualNeural"): Promise<Blob> => {
  const key = import.meta.env.VITE_AZURE_TTS_KEY;
  const region = "uksouth";

  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `
    <speak version="1.0" xml:lang="en-US">
       

      <voice name="${voiceCode}">
        ${rawText}
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

  return await response.blob();
};

// ---------- Generate Meditation Script ----------
export const generateScript = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  practiceType: string
) => {
  const details = MedTypesAndAffirmations.find((m) => m.type === meditationType);
  const type = PracticeTypes.find((p) => p.name === practiceType);
  const wordsAndBreaks = mapDurationToWords[duration as keyof typeof mapDurationToWords];

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
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );

  const content = response.data.choices[0].message.content.trim();

  return { title: `${meditationType} Meditation`, content };
};

// ---------- Main Meditation Generator ----------
export const generateMeditation = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  practiceType: string,
  userId: string,
  voiceCode = "en-GB-OllieMultilingualNeural"
): Promise<MeditationResponse> => {
  try {
    console.log("generating", practiceType);
    const meditationData = await generateScript(meditationType, duration, language, practiceType);
    console.log("meditationData generated", meditationData);
    // Generate audio via Azure TTS
    const audioBlob = await generateAudio(meditationData.content, voiceCode);
    console.log("audio generated", audioBlob);
    // Convert Blob -> base64 for Firebase upload
    const arrayBuffer = await audioBlob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    // Upload to Firebase Cloud Function
    const storageEndoint = "https://us-central1-reszen8-1d832.cloudfunctions.net/api/uploadAudio";
    // const storageEndoint = "http://127.0.0.1:5001/reszen8-1d832/us-central1/api/uploadAudio";
    const uploadResponse = await axios.post(storageEndoint, {
      audioBase64: base64Audio,
      title: `${meditationData.title}`,
      content: meditationData.content,
      generatedBy: userId,
      type: meditationType,
      language,
      style: practiceType || "Bespoke",
      bespokeMed: true,
      voiceCode,
    });

    const audioUrl = uploadResponse.data.audioUrl;

    return {
      ...meditationData,
      audioUrl,
      downloadLink: audioUrl,
      audioBlob,
    };
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};

export const generateStaticMedFromScript = async (
  title: string,
  meditationType: string,
  practiceType: string,
  script: string,
  voiceCode: string
) => {
  try {
    // Generate audio via Azure TTS
    const audioBlob = await generateAudio(script, voiceCode);
    console.log("audio generated", audioBlob);
    // Convert Blob -> base64 for Firebase upload
    const arrayBuffer = await audioBlob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    // Upload to Firebase Cloud Function
    const storageEndoint = "https://us-central1-reszen8-1d832.cloudfunctions.net/api/uploadStaticAudio";
    // const storageEndoint = "http://127.0.0.1:5001/reszen8-1d832/us-central1/api/uploadStaticAudio";
    const uploadResponse = await axios.post(storageEndoint, {
      audioBase64: base64Audio,
      title: title,
      content: script,
      generatedBy: "God",
      type: meditationType,
      style: practiceType,
      id: uuidv4(),
      voiceCode,
    });

    console.log(uploadResponse);
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};
