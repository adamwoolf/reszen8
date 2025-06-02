import axios from "axios";

// Get environment variables with type safety
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel)

console.log("11 label api key", ELEVENLABS_API_KEY);

interface MeditationResponse {
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
  language: string = 'en',
  voiceStyle: string = ''
): Promise<{ title: string; content: string }> => {
  try {
    // Map language codes to full language names for the prompt
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
    };

    const languageName = languageNames[language] || 'English';
    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI meditation guide. Create a guided meditation script in ${languageName} based on the following parameters. ${voiceStyle} ` +
                     'The meditation should flow naturally and be suitable for the specified duration. ' +
                     'Include guidance on breathing and body awareness. Format the response as a valid JSON object with "title" and "content" fields. ' +
                     'The response must be valid JSON with no additional text before or after the JSON object. ' +
                     `The entire meditation must be in ${languageName} language.`,
          },
          {
            role: "user",
            content: `Create a ${type} meditation in ${languageName} that is approximately ${duration} seconds long.`,
          }
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

    if (!response.data.choices || !response.data.choices[0].message) {
      console.error('OpenAI API Error:', response.data);
      throw new Error('Failed to generate meditation');
    }

    // Parse the response content as JSON
    const content = response.data.choices[0].message.content.trim();
    let result;
    
    try {
      // Try to parse the content directly as JSON
      result = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse meditation content as JSON');
      }
    }
    
    return {
      title: result.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Meditation`,
      content: result.content || 'No content generated.',
    };
  } catch (error) {
    console.error('Error in generateMeditation:', error);
    
    // More specific error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        console.error('Error headers:', axiosError.response.headers);
        throw new Error(`API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('Error request:', axiosError.request);
        throw new Error('No response received from the API. Please check your network connection.');
      }
    }
    
    throw error;
  }
};
