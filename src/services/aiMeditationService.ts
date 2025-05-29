import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID (Rachel)

export interface MeditationResponse {
  title: string;
  content: string;
  audioUrl?: string;
}

export const generateMeditation = async (
  meditationType: string,
  duration: string,
  additionalDetails: string
): Promise<MeditationResponse> => {
  try {
    // Call OpenAI API to generate meditation content
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional meditation guide with years of experience in creating personalized meditation scripts.',
          },
          {
            role: 'user',
            content: `Create a ${duration}-second ${meditationType} meditation. 
            The meditation should be exactly ${duration} seconds when spoken at a natural pace.
            Keep the content focused and appropriate for the short duration.
            ${additionalDetails ? `Additional details: ${additionalDetails}` : ''} 
            Format the response as a valid JSON object with 'title' and 'content' properties.`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Parse the response
    const content = response.data.choices[0].message.content;
    let meditationData: Omit<MeditationResponse, 'audioUrl'>;
    
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
      const audioResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          text: meditationData.content,
          model_id: 'eleven_monolingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          responseType: 'blob',
        }
      );

      // Convert blob to URL
      const audioBlob = new Blob([audioResponse.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        ...meditationData,
        audioUrl,
      };
    } catch (audioError) {
      console.error('Error generating audio:', audioError);
      // Return text response even if audio generation fails
      return meditationData;
    }
  } catch (error) {
    console.error('Error generating meditation:', error);
    throw new Error('Failed to generate meditation. Please try again later.');
  }
};
