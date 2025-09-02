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

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
  downloadLink?: string;
  audioBlob?: Blob;
}

// ---------- Main Meditation Generator ----------
export const generateMeditation = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  practiceType: string,
  userId: string,
  voiceCode = "en-GB-BellaNeural",
  title: string
) => {
  try {
    const endpoint = "https://us-central1-reszen8-1d832.cloudfunctions.net/api/generateMeditation";
    // const endpoint = "http://127.0.0.1:5001/reszen8-1d832/us-central1/api/generateMeditation";
    const meditation = await axios.post(endpoint, {
      meditationType,
      duration,
      language,
      practiceType,
      userId,
      voiceCode,
      title,
    });

    console.log("MEDITATION", meditation);

    return meditation;
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};

export const generateArticleWithAudio = (title: string, text: string) => {};

export const generateStaticMedFromScript = async (
  title: string,
  meditationType: string,
  practiceType: string,
  script: string,
  voiceCode: string
) => {
  try {
    // Generate audio via Azure TTS

    // Upload to Firebase Cloud Function
    const storageEndoint = "https://us-central1-reszen8-1d832.cloudfunctions.net/api/generateStaticMeditation";
    // const storageEndoint = "http://127.0.0.1:5001/reszen8-1d832/us-central1/api/generateStaticMeditation";
    const uploadResponse = await axios.post(storageEndoint, {
      title,
      generatedBy: "God",
      type: meditationType,
      style: practiceType,
      id: uuidv4(),
      voiceCode,
      script,
      meditationType,
    });

    console.log(uploadResponse);
    return uploadResponse;
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};
