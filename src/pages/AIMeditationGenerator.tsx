import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { v4 as uuidv4 } from 'uuid';

// Mock audio data - in a real app, this would come from your API
const mockAudioData = {
  mindfulness: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  sleep: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  anxiety: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  gratitude: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  focus: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'loving-kindness': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
};

const AIMeditationGenerator: React.FC = () => {
  const [meditationType, setMeditationType] = useState('mindfulness');
  const [duration, setDuration] = useState('5');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Generated meditation state
  const [generatedMeditation, setGeneratedMeditation] = useState<{
    title: string;
    content: string;
    audioUrl?: string;
  } | null>(null);

  // Error state
  const [error, setError] = useState('');
  const { addItem } = useSavedItems();
  const navigate = useNavigate();

  const meditationTypes = [
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'anxiety', label: 'Anxiety Relief' },
    { value: 'gratitude', label: 'Gratitude' },
    { value: 'focus', label: 'Focus & Concentration' },
    { value: 'loving-kindness', label: 'Loving-Kindness' },
  ];

  // Update durations array to go up to 15 minutes
  const durations = ['3', '5', '8', '10', '15'];

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play();
      startProgressTimer();
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress bar
  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        setCurrentTime(audioRef.current.currentTime);

        // Check if audio ended
        if (audioRef.current.ended) {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        }
      }
    }, 100);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock response based on type
      const meditationTitles = {
        mindfulness: 'Mindful Breathing Exercise',
        sleep: 'Peaceful Sleep Meditation',
        anxiety: 'Calming Anxiety Relief',
        gratitude: 'Gratitude Meditation',
        focus: 'Deep Focus Session',
        'loving-kindness': 'Loving-Kindness Practice',
      };

      const meditationContent = {
        mindfulness: `Sit comfortably and close your eyes. Take a deep breath in through your nose, counting to four. Hold your breath for a count of four, then exhale slowly through your mouth for a count of six. Continue this pattern, focusing on the sensation of your breath. If your mind wanders, gently bring your attention back to your breath.`,
        sleep: `Lie down in a comfortable position. Close your eyes and take three deep breaths. With each exhale, feel your body becoming heavier and more relaxed. Imagine yourself in a peaceful place, surrounded by tranquility. Let go of any tension with each out-breath.`,
        anxiety: `Find a comfortable seated position. Place one hand on your chest and the other on your belly. Breathe in slowly through your nose, feeling your belly rise. Exhale slowly through pursed lips. With each breath, imagine releasing tension and anxiety.`,
        gratitude: `Sit comfortably and take a few deep breaths. Bring to mind three things you're grateful for today. They can be simple things like the warmth of the sun or a kind word from a friend. Sit with the feeling of gratitude for a few moments.`,
        focus: `Sit with a straight back. Choose a point to focus on, like your breath or a candle flame. When your mind wanders, gently bring your attention back to your focus point. Practice this for a few minutes.`,
        'loving-kindness': `Close your eyes and take a few deep breaths. Bring to mind someone you love. Silently repeat: "May you be happy. May you be healthy. May you be safe. May you live with ease." Then extend these wishes to yourself and all beings.`,
      };

      const newMeditation = {
        title: meditationTitles[meditationType as keyof typeof meditationTitles] || 'Custom Meditation',
        content: meditationContent[meditationType as keyof typeof meditationContent] || 'Your custom meditation content will appear here.',
        audioUrl: mockAudioData[meditationType as keyof typeof mockAudioData] || mockAudioData.mindfulness,
      };

      setGeneratedMeditation(newMeditation);

      // Reset audio state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);

      // Scroll to the generated content
      setTimeout(() => {
        const element = document.getElementById('generated-content');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err) {
      console.error('Error generating meditation:', err);
      setError('Failed to generate meditation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDashboard = () => {
    if (!generatedMeditation) return;

    const newMeditation = {
      id: parseInt(uuidv4().replace(/\D/g, '').slice(0, 8)),
      title: generatedMeditation.title,
      type: 'meditation' as const,
      duration: `${duration} min`,
    };

    const isAdded = addItem(newMeditation);

    if (isAdded) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
          AI Meditation Generator
        </h1>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-amber-400">Create Your Custom Meditation</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="meditationType" className="block text-sm font-medium text-gray-300 mb-2">
                Meditation Type
              </label>
              <select
                id="meditationType"
                value={meditationType}
                onChange={(e) => setMeditationType(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white"
                required
                disabled={isGenerating}
              >
                <option value="">Select a meditation type</option>
                {meditationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration: {duration} minutes
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  disabled={isGenerating}
                  list="duration-markers"
                />
                <datalist id="duration-markers" className="flex justify-between w-full">
                  <option value="3" label="3"></option>
                  <option value="5" label="5"></option>
                  <option value="8" label="8"></option>
                  <option value="10" label="10"></option>
                  <option value="15" label="15"></option>
                </datalist>
                <span className="text-amber-400 font-medium w-8 text-center">{duration}</span>
              </div>
            </div>

            <div>
              <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-300 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Any specific focus, mood, or intention for your meditation..."
                rows={3}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white"
                disabled={isGenerating}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isGenerating}
                className={`px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Meditation'
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {generatedMeditation && (
          <div id="generated-content" className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700 transition-all duration-500 transform">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-amber-400">{generatedMeditation.title}</h2>
              <button
                onClick={handleSaveToDashboard}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save to Dashboard
              </button>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="whitespace-pre-line text-gray-200 leading-relaxed">
                {generatedMeditation.content}
              </p>
            </div>

            {generatedMeditation.audioUrl && (
              <div className="mt-8 bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center mb-4">
                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <div className="ml-4 flex-1">
                    <div className="text-sm text-gray-300 mb-1">
                      {formatTime(currentTime * 1000)} / {duration}:00
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={generatedMeditation.audioUrl}
                  onEnded={() => {
                    setIsPlaying(false);
                    setProgress(0);
                    setCurrentTime(0);
                  }}
                  onTimeUpdate={(e) => {
                    const audio = e.target as HTMLAudioElement;
                    setCurrentTime(audio.currentTime);
                    setProgress((audio.currentTime / audio.duration) * 100 || 0);
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMeditationGenerator;
