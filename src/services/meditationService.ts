import { Configuration, OpenAIApi } from 'openai';

type MeditationTheme = 'mindfulness' | 'sleep' | 'anxiety' | 'gratitude' | 'focus' | 'loving-kindness';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateMeditationScript = async (theme: MeditationTheme, durationSeconds = 5): Promise<string> => {
  try {
    const prompt = `Create a short ${durationSeconds}-second ${theme} meditation script. 
    It should be exactly ${durationSeconds} seconds when read at a calm, steady pace. 
    Focus on ${theme} techniques.`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a meditation guide. Create short, effective meditation scripts." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return response.data.choices[0]?.message?.content || "Let's begin this meditation...";
  } catch (error) {
    console.error('Error generating meditation script:', error);
    throw error;
  }
};

export const generateMultipleMeditations = async (count: number, durationSeconds = 5): Promise<{title: string, script: string, theme: MeditationTheme}[]> => {
  const themes: MeditationTheme[] = ['mindfulness', 'sleep', 'anxiety', 'gratitude', 'focus', 'loving-kindness'];
  const meditations = [];
  
  for (let i = 0; i < count; i++) {
    const theme = themes[i % themes.length];
    const script = await generateMeditationScript(theme, durationSeconds);
    meditations.push({
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Meditation ${i + 1}`,
      script,
      theme
    });
  }
  
  return meditations;
};
