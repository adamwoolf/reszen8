import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase"; // adjust path as needed
import { collection, addDoc, Timestamp } from "firebase/firestore";

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
 * @param voiceStyle Voice style and language instructions
 * @returns Promise with generated meditation content
 */
export const generateMeditation = async (
  type: string,
  duration: number,
  language: string = "en",
  voiceStyle: string = ""
): Promise<{ title: string; content: string }> => {
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
              `You are an AI meditation guide. Create a guided meditation script in ${languageName} based on the following parameters. ${voiceStyle} ` +
              "The meditation should flow naturally and be suitable for the specified duration. " +
              'Include guidance on breathing and body awareness. Format the response as a valid JSON object with "title" and "content" fields. ' +
              "The response must be valid JSON with no additional text before or after the JSON object. " +
              `The entire meditation must be in ${languageName} language.`,
          },
          {
            role: "user",
            content: `Create a ${duration}-second ${meditationType} meditation. 
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

    const content = response.data.choices[0].message.content;
    let meditationData: Omit<MeditationResponse, "audioUrl">;

    try {
      meditationData = JSON.parse(content);
    } catch {
      meditationData = {
        title: `${meditationType} Meditation`,
        content,
      };
    }

    // STEP 2a: Generate audio from script via Amazon Polly
    // const polly = new PollyClient({
    //   region: AWS_REGION,
    //   credentials: {
    //     accessKeyId: AWS_ACCESS_KEY_ID,
    //     secretAccessKey: AWS_SECRET_ACCESS_KEY,
    //   },
    // });

    // const synthCommand = new SynthesizeSpeechCommand({
    //   Text: meditationData.content,
    //   OutputFormat: "mp3",
    //   VoiceId: "Joanna", // Change voice if needed
    // });

    // const audioData = await polly.send(synthCommand);
    // if (!audioData.AudioStream) {
    //   throw new Error("No audio data returned from Polly");
    // }
    // POLLY ENDS HERE

    // STEP 2: Generate audio from script via ElevenLabs
    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
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
    // ELEVENLABS ends here
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
  }
};
