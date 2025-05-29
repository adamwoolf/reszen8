import axios from "axios";

// Get environment variables with type safety
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel)

console.log("11 label api key", ELEVENLABS_API_KEY);

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
}

// Add type for Axios error with response
type AxiosErrorWithResponse = Error & {
  response?: {
    data?: any;
    status?: number;
    headers?: any;
  };
  request?: any;
};

export const generateMeditation = async (
  meditationType: string,
  duration: string,
  additionalDetails: string
): Promise<MeditationResponse> => {
  try {
    // Call OpenAI API to generate meditation content
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional meditation guide with years of experience in creating personalized meditation scripts.",
          },
          {
            role: "user",
            content: `Create a ${duration}-second ${meditationType} meditation. 
            The meditation should be exactly ${duration} seconds when spoken at a natural pace.
            Keep the content focused and appropriate for the short duration.
            ${additionalDetails ? `Additional details: ${additionalDetails}` : ""} 
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

    // Parse the response
    const content = response.data.choices[0].message.content;
    let meditationData: Omit<MeditationResponse, "audioUrl">;

    try {
      meditationData = JSON.parse(content);
    } catch (e) {
      // If response isn't valid JSON, use it as is
      meditationData = {
        title: `${meditationType} Meditation`,
        content: content,
      };
    }

    // Generate audio using ElevenLabs
    try {
      console.log("Calling ElevenLabs API with voice ID:", ELEVENLABS_VOICE_ID);
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
      console.log("TEXT", meditationData.content);
      console.log("RESPONSE", audioResponse);

      console.log("ElevenLabs API response status:", audioResponse.status);

      if (!audioResponse.data) {
        throw new Error("No audio data received from ElevenLabs");
      }

      // Convert blob to URL
      const audioBlob = new Blob([audioResponse.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Successfully created audio URL");

      return {
        ...meditationData,
        audioUrl,
      };
    } catch (error: unknown) {
      console.error("Error generating audio:");
      const audioError = error as AxiosErrorWithResponse;

      if (audioError.response) {
        console.error("Error response data:", audioError.response.data);
        console.error("Error status:", audioError.response.status);
        console.error("Error headers:", audioError.response.headers);
      } else if (audioError.request) {
        console.error("No response received:", audioError.request);
      } else {
        console.error("Error setting up request:", audioError.message);
      }
      // Return text response even if audio generation fails
      return meditationData;
    }
  } catch (error: unknown) {
    console.error("Error generating meditation:", error);
    throw new Error("Failed to generate meditation. Please try again later.");
  }
};
