import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase"; // adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "./helpers";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel)

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
  downloadLink?: string;
  audioBlob?: Blob;
}

type AxiosErrorWithResponse = Error & {
  response?: {
    data?: any;
    status?: number;
    headers?: any;
  };
  request?: any;
};

/**
 * Generates meditation content using OpenAI's GPT-4 model
 * @param type Type of meditation (e.g., 'mindfulness', 'sleep')
 * @param duration Duration in seconds
 * @param language Language code (e.g., 'en', 'es', 'fr')
 * @param voiceId The ID of the voice to use for text-to-speech
 * @param userId User ID for tracking
 * @returns Promise with generated meditation content
 */
export const generateMeditation = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  voiceId: string = ELEVENLABS_VOICE_ID, // Use provided voice ID or fallback to default
  userId: string
): Promise<{ title: string; content: string; audioUrl: string; downloadLink: string }> => {
  try {
    // Map language codes to full language names for the prompt
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
    };

    const languageName = languageNames[language] || "English";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              `You are an AI meditation guide. Create a guided meditation script in ${languageName}. ` +
              "The meditation should flow naturally and be suitable for the specified duration. " +
              'Include guidance on breathing and body awareness. Format the response as a valid JSON object with "title" and "content" fields. ' +
              "The response must be valid JSON with no additional text before or after the JSON object. " +
              `The entire meditation must be in ${languageName} language.`,
          },
          {
            role: "user",
            content: `Create a ${duration}-second ${meditationType} meditation in ${languageName}. 
              The meditation should be exactly ${duration} seconds when spoken at a natural pace.
              Keep the content focused and appropriate for the short duration.
              Format the response as a valid JSON object with 'title' and 'content' properties.`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();

    let meditationData: Omit<MeditationResponse, "audioUrl">;

    try {
      meditationData = JSON.parse(content);
    } catch {
      meditationData = {
        title: `${meditationType} Meditation`,
        content,
      };
    }

    // Generate audio from script via ElevenLabs using the provided voiceId
    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, // Use the provided voiceId
      {
        text: meditationData.content,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    if (!audioResponse.data) {
      throw new Error("No audio data received from ElevenLabs");
    }
    const audioBlob = new Blob([audioResponse.data], { type: "audio/mp3" });
    const reader = new FileReader();

    // STEP 3: Upload to Firebase via Cloud Function
    const firebaseAudioUrl = await new Promise<string>((resolve, reject) => {
      console.log("uploading");
      reader.onloadend = async () => {
        const audioBase64 = (reader.result as string).split(",")[1];
        try {
          const uploadResponse = await axios.post(
            "https://us-central1-reszen8-1d832.cloudfunctions.net/api/uploadAudio",
            {
              audioBase64,
              title: meditationData.title,
              content: meditationData.content,
              generatedBy: userId,
              type: meditationType,
              language: languageName,
            }
          );

          resolve(uploadResponse.data.audioUrl);
          console.log("uploaded");
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Optional: trigger download
    // saveAudioToFile(audioBlob, `${meditationData.title}.mp3`);
    console.log("audio", firebaseAudioUrl);
    return {
      ...meditationData,
      audioUrl: firebaseAudioUrl,
      downloadLink: firebaseAudioUrl,
      audioBlob,
    };
  } catch (error) {
    console.error("Failed to generate meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
    // Try to parse the content directly as JSON
  }
};

export const generateScript = async (
  meditationType: string,
  duration: string,
  language: string = "en",
  practiceType: string
) => {
  console.log(duration);
  const details = MedTypesAndAffirmations.find((m) => m.type === meditationType);
  const type = PracticeTypes.find((p) => p.name === practiceType);
  const wordsAndBreaks = mapDurationToWords[+duration as keyof typeof mapDurationToWords];
  const prompt = `You are a skilled meditation script writer. Write a calming, natural-sounding guided meditation script in English (UK) that matches the following parameters:


  • Meditation Type: ${meditationType} for ${practiceType} - which is ${type?.description}
  • Overview: ${details?.description}
  • Tone: Warm, gentle, and soothing  
  • Pacing: Moderate to slow, suitable for audio narration  
  • Structure: Introduction → Gentle body and breath awareness → Thematic guided section → Closing wind-down  
  • Duration: ${duration} minutes (use approximately ${wordsAndBreaks.words} words)  
  • Audience: General adult audience, no spiritual or religious language  
  • Voice: The script should be suitable for Eleven Labs voice ${details?.voice?.name} with ID ${details?.voice?.id} 
  • Make the meditation unique.  
  • Content repetition: Keep repetition low or none. Do not repeat affirmations, phrases, or transitions unless purposefully reflective.  
  • Identify natural pause points (after important thoughts, transitions, affirmations, breath cues, etc.).
  • Insert approximately ${
    wordsAndBreaks.breaks
  } breaks, formatted as <break time='X.Xs'/>, and lasting between 1 and  3 seconds each time, as is appropriate, to create a more realistic and calming delivery, especially for meditations.  No two breaks should have the same duration and they should always be on their own in a paragraph.
  • Total pause time should be around ${wordsAndBreaks.totalPauseTime} seconds.
  • Affirmations: Include affirmations appropriate to the meditation type. These should be brief, realistic, and uplifting. Integrate them naturally during the guided portion. Avoid listing them — instead, weave them into the flow. For example:
 ${details?.affirmations.map((a) => a)}  
  
  Only output the final meditation script, formatted as plain text with the <break time='X.Xs'/> tags each as its own paragraph. Do not include explanations or formatting notes.`;

  // Map language codes to full language names for the prompt
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
  };
  const languageName = languageNames[language] || "English";
  console.log(prompt);
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: `Please generate a ${duration}-minute ${meditationType} meditation`,
        },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  console.log(response.data.choices);
  const content = response.data.choices[0].message.content.trim();
  console.log("SCRIPT:", content);
  return content;
};
