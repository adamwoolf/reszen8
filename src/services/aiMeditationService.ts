import axios from "axios";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "./helpers";
import { v4 as uuidv4 } from "uuid";
import { AWS_DB_ENDPOINT } from "../constants";

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
  title: string,
  immersive: boolean,
  script?: any
) => {
  try {
    // const endpoint = `${AWS_DB_ENDPOINT}/generateMeditation`;
    const endpoint = `https://rot47b3oq9.execute-api.eu-north-1.amazonaws.com/Prod/create-meditation`;

    const meditation = await axios.post(
      endpoint,
      {
        meditationType,
        duration,
        language,
        practiceType,
        userId,
        voiceCode,
        title,
        immersive,
        script,
      },

      { headers: { "Content-Type": "application/json" }, timeout: 120000, validateStatus: (status) => status < 500 }
    );

    console.log("MEDITATION", meditation);

    return meditation;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 503 || status === 504) {
      // Gateway timed out — tell user to check back later
      return {
        message: "Your meditation is being processed. Please check Your Dashboard in a few minutes.",
        status: status,
      };
    } else {
      console.error("Failed to generate meditation:", error);
      throw new Error("Failed to generate meditation. Please try again later.");
    }
  }
};

export const generateScript = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  practiceType: string,
  title: string,
  immersive: boolean
) => {
  try {
    // const endpoint = `${AWS_DB_ENDPOINT}/generateScript`;
    const endpoint = `https://rot47b3oq9.execute-api.eu-north-1.amazonaws.com/Prod/create-script`;

    const script = await axios.post(
      endpoint,
      {
        meditationType,
        duration,
        language,
        practiceType,
        title,
        immersive,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 120000, validateStatus: (status) => status < 500 }
    );

    console.log("SCRIPT", script);

    return script;
  } catch (error) {
    console.error("Failed to generate script:", error);
    throw new Error("Failed to generate script. Please try again later.");
  }
};

export const generateArticleWithAudio = async (
  title: string,
  text: string,
  formattedText: string,
  voiceCode = "en-GB-BellaNeural",
  meditationType: string,
  practiceType: string,
  immersive: boolean
) => {
  try {
    // Generate audio via Azure TTS

    const endpoint = `${AWS_DB_ENDPOINT}/generateArticle`;

    const uploadResponse = await axios.post(endpoint, {
      title,
      generatedBy: "RESZEN8",
      id: uuidv4(),
      voiceCode,
      text,
      formattedText,
      meditationType,
      practiceType,
      immersive,
    });

    console.log(uploadResponse);
    return uploadResponse;
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error(`Failed to generate meditation. Please try again later. ${error.message}`);
  }
};

export const generateStaticMedFromScript = async (
  title: string,
  meditationType: string,
  practiceType: string,
  script: string,
  voiceCode: string,
  immersive: boolean,
  introMed?: boolean,
  collection?: string,
  episode?: string
) => {
  try {
    // Generate audio via Azure TTS

    const endpoint = `${AWS_DB_ENDPOINT}/generateStaticMeditation`;

    const uploadResponse = await axios.post(endpoint, {
      title,
      generatedBy: "RESZEN8",
      id: uuidv4(),
      voiceCode,
      script,
      meditationType,
      practiceType,
      immersive,
      introMed,
      collection,
      episode,
    });

    return uploadResponse;
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};
