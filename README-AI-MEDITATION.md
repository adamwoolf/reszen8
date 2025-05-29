# AI Meditation Generator

This is an AI-powered meditation generator that creates personalized meditation scripts and audio using OpenAI and ElevenLabs APIs.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- ElevenLabs API key (optional, for text-to-speech)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import the repository to Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

### Netlify

1. Push your code to a Git repository
2. Create a new site in Netlify and import your repository
3. Add your environment variables in the site settings
4. Set the build command to `npm run build` and publish directory to `build`
5. Deploy!

## Environment Variables

- `REACT_APP_OPENAI_API_KEY`: Your OpenAI API key (required)
- `REACT_APP_ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional, for text-to-speech)

## Features

- Generate custom meditation scripts using AI
- Convert text to speech with ElevenLabs (if API key is provided)
- Play/pause audio playback
- Save meditations to your dashboard
- Responsive design that works on all devices

## Troubleshooting

- If audio generation fails, check your ElevenLabs API key and quota
- Ensure your OpenAI API key has access to the GPT-4 model
- Check the browser console for any error messages

## License

This project is licensed under the MIT License.
