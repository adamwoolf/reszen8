// Define the VoiceOption interface
export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  style: string;
  language: string;
  supportedLanguages: string[];
}

// Voice options with different genders and styles
export const VOICE_OPTIONS: VoiceOption[] = [
  // English Voices
  { 
    id: '21m00Tcm4TlvDq8ikWAM', 
    name: 'Rachel', 
    gender: 'Female', 
    style: 'Conversational and soothing', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'AZnzlk1XvdvUeBnXmlld', 
    name: 'Domi', 
    gender: 'Female', 
    style: 'Expressive and dynamic', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Bella', 
    gender: 'Female', 
    style: 'Calm and clear', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'ErXwobaYiN019PkySvjV', 
    name: 'Antoni', 
    gender: 'Male', 
    style: 'Deep and calming', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'MF3mGyEYCl7XYWbV9V6O', 
    name: 'Elli', 
    gender: 'Female', 
    style: 'Warm and friendly', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'TxGEqnHWrfWFTfGW9XjX', 
    name: 'Josh', 
    gender: 'Male', 
    style: 'Confident and clear', 
    language: 'en',
    supportedLanguages: ['en']
  },
  
  // Multilingual Voices
  { 
    id: '21m00Tcm4TlvDq8ikWAM', 
    name: 'Rachel', 
    gender: 'Female', 
    style: 'English - Conversational', 
    language: 'en',
    supportedLanguages: ['en']
  },
  { 
    id: 'GBv7mTt0atIp3Br8iCZE', 
    name: 'Liam', 
    gender: 'Male', 
    style: 'Multilingual - French, Spanish, German, Italian', 
    language: 'multilingual',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it']
  },
  { 
    id: 'XUmeK8VMRpvy2jL8oWjK', 
    name: 'Dorothy', 
    gender: 'Female', 
    style: 'Multilingual - Clear and expressive', 
    language: 'multilingual',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it']
  },
  { 
    id: 'pNInz6obpgDQGcFmaJgB', 
    name: 'Adam', 
    gender: 'Male', 
    style: 'Multilingual - Professional tone', 
    language: 'multilingual',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it']
  },
  
  // Language-specific voices
  { 
    id: 'N2lVS1w4EtoT3dr4eOWO', 
    name: 'Dorothy', 
    gender: 'Female', 
    style: 'Spanish - Clear and gentle', 
    language: 'es',
    supportedLanguages: ['es']
  },
  { 
    id: 'ZQe5CZNOzWyzPSCn5a3c', 
    name: 'Charlotte', 
    gender: 'Female', 
    style: 'French - Warm and motherly', 
    language: 'fr',
    supportedLanguages: ['fr']
  },
  { 
    id: 'onwK4e9ZLuTAKqWW03F9', 
    name: 'Callum', 
    gender: 'Male', 
    style: 'German - Professional', 
    language: 'de',
    supportedLanguages: ['de']
  },
  { 
    id: 'XqAewkCSGaLFhJfzrQhI', 
    name: 'Liam', 
    gender: 'Male', 
    style: 'Italian - Friendly', 
    language: 'it',
    supportedLanguages: ['it']
  },
  { 
    id: 'z9fAnlkpzviPz5dnckcZ', 
    name: 'Charlotte', 
    gender: 'Female', 
    style: 'Portuguese - Warm', 
    language: 'pt',
    supportedLanguages: ['pt']
  },
  { 
    id: 'VR6AewLTigWG4xSOukaG', 
    name: 'Arnold', 
    gender: 'Male', 
    style: 'Polish - Strong', 
    language: 'pl',
    supportedLanguages: ['pl']
  },
  { 
    id: 'yoZ06aMxZJJ28mfd3POQ', 
    name: 'Sam', 
    gender: 'Male', 
    style: 'Hindi - Friendly', 
    language: 'hi',
    supportedLanguages: ['hi']
  },
];

// Get the default voice ID (Rachel as default)
export const getDefaultVoiceId = () => '21m00Tcm4TlvDq8ikWAM';

// Language-specific preview texts
const PREVIEW_TEXTS: Record<string, string> = {
  en: "Hello, this is a preview of my voice. I hope you like how I sound.",
  es: "Hola, esta es una vista previa de mi voz. Espero que te guste cómo sueno.",
  fr: "Bonjour, ceci est un aperçu de ma voix. J'espère que vous aimez ma façon de parler.",
  de: "Hallo, dies ist eine Vorschau meiner Stimme. Ich hoffe, sie gefällt Ihnen.",
  it: "Ciao, questa è un'anteprima della mia voce. Spero che ti piaccia come suono.",
  pt: "Olá, esta é uma prévia da minha voz. Espero que goste do meu som.",
  pl: "Cześć, to jest podgląd mojego głosu. Mam nadzieję, że Ci się podoba.",
  hi: "नमस्ते, यह मेरी आवाज़ का पूर्वावलोकन है। मुझे आशा है कि आपको मेरी आवाज़ पसंद आएगी।",
  multilingual: "Hello, Bonjour, Hola, Hallo, Ciao, Olá - I can speak multiple languages with natural fluency."
};

// Cache for preview audio URLs
const previewAudioCache: Record<string, string> = {};

export const previewVoice = async (voiceId: string, language: string): Promise<void> => {
  try {
    // If we have a cached version, use it
    const cacheKey = `${voiceId}-${language}`;
    if (previewAudioCache[cacheKey]) {
      const audio = new Audio(previewAudioCache[cacheKey]);
      return audio.play().catch(e => console.error("Error playing cached preview:", e));
    }

    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    if (!voice) {
      throw new Error('Voice not found');
    }

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key is not configured');
    }

    // Use the provided language for preview text, fallback to voice language, then English
    const previewLanguage = language || voice.language || 'en';
    const previewText = PREVIEW_TEXTS[previewLanguage] || PREVIEW_TEXTS.en;
    
    if (!previewText) {
      throw new Error(`No preview text available for language: ${previewLanguage}`);
    }
    
    console.log(`Generating preview for voice ${voiceId} in ${previewLanguage}:`, previewText);
    
    // Use multilingual model for multilingual voices or non-English languages, otherwise use the standard model
    const modelId = (voice.language === 'multilingual' || previewLanguage !== 'en')
      ? 'eleven_multilingual_v2' 
      : 'eleven_monolingual_v1';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: previewText,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, error);
      throw new Error(`Failed to generate preview: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Cache the URL for future use with language key
    previewAudioCache[cacheKey] = audioUrl;
    
    // Play the audio
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    await audio.play().catch(e => {
      console.error("Error playing audio:", e);
      throw new Error("Failed to play audio preview");
    });
  } catch (error) {
    console.error('Error in voice preview:', error);
    throw error;
  }
};

export const stopAllPreviews = (): void => {
  // Stop any currently playing previews
  Object.values(previewAudioCache).forEach(url => {
    const audio = new Audio();
    audio.src = url;
    audio.pause();
  });
};

export const convertTextToSpeech = async (text: string, voiceId: string = getDefaultVoiceId(), language: string = 'en'): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('ElevenLabs API key is not configured');
      throw new Error('Audio generation service is not properly configured');
    }
    
    console.log('Using voice ID:', voiceId);
    console.log('Target language:', language);
    console.log('Text length:', text.length);
    
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    if (!voice) {
      console.error('Voice not found for ID:', voiceId);
      throw new Error('Selected voice is not available');
    }

    // Check if the selected voice supports the target language
    if (!voice.supportedLanguages.includes(language) && !voice.supportedLanguages.includes('multilingual')) {
      console.warn(`Voice ${voice.name} does not support language ${language}. Falling back to English.`);
      // Instead of failing, we'll try to proceed with the voice anyway
      // as some voices might still work with unsupported languages
    }

    // Always use the multilingual model for non-English languages
    const modelId = language !== 'en' || voice.language === 'multilingual'
      ? 'eleven_multilingual_v2'
      : 'eleven_monolingual_v1';

    console.log('Using model:', modelId);
    
    // Prepare the request body with language-specific settings
    const requestBody: any = {
      text: text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    };

    // Add language code for multilingual model
    if (modelId === 'eleven_multilingual_v2' && language !== 'en') {
      requestBody.model_id = `${modelId}_${language}`;
    }
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Provide more specific error messages
      if (response.status === 400) {
        throw new Error('Invalid request. The text might contain unsupported characters for the selected language.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      } else if (response.status === 404) {
        throw new Error('Voice not found. Please select a different voice.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else {
        throw new Error(`Failed to generate audio: ${response.status} ${response.statusText}`);
      }
    }

    // Check if we got valid audio data
    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Received empty audio data from the server');
    }

    console.log('Audio blob created, size:', audioBlob.size);
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Test the audio URL
    try {
      const testAudio = new Audio(audioUrl);
      await testAudio.play();
      testAudio.pause();
      testAudio.currentTime = 0;
    } catch (e) {
      console.error('Error testing audio URL:', e);
      throw new Error('Generated audio is not playable');
    }
    
    return audioUrl;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    // Re-throw the error with a more user-friendly message
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to the audio service. Please check your internet connection.');
      }
      // Other error messages are already user-friendly
      throw error;
    }
    throw new Error('An unknown error occurred during audio generation');
  }
};
