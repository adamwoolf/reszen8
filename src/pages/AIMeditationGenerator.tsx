import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { v4 as uuidv4 } from 'uuid';
import { generateMeditation } from '../services/aiMeditationService';
import { toast } from 'react-toastify';

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
}

const AIMeditationGenerator: React.FC = () => {
  const [meditationType, setMeditationType] = useState('mindfulness');
  const [duration, setDuration] = useState('5');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
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

  const durations = ['5', '10', '15', '30', '60', '120', '300'];

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return secs === 0 ? `${mins} min` : `${mins}m ${secs}s`;
  };

  useEffect(() => {
    // Clean up audio URL when component unmounts
    return () => {
      if (generatedMeditation?.audioUrl) {
        URL.revokeObjectURL(generatedMeditation.audioUrl);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [generatedMeditation]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        toast.error('Failed to play audio. Please try again.');
      });
      startProgressTimer();
    }
    setIsPlaying(!isPlaying);
  };

  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        setCurrentTime(audioRef.current.currentTime);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const toastId = toast.loading('Generating your meditation...');
      
      try {
        const result = await generateMeditation(meditationType, duration, additionalDetails);
        
        setGeneratedMeditation(result);
        
        // If audio is being generated, show a different message
        if (!result.audioUrl) {
          toast.update(toastId, {
            render: 'Meditation generated! (Audio generation skipped - check console for details)',
            type: 'info',
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(toastId, {
            render: 'Meditation generated successfully!',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
        }
        
        // Scroll to the generated content
        setTimeout(() => {
          const element = document.getElementById('generated-content');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
      } catch (error) {
        console.error('Error in meditation generation:', error);
        toast.update(toastId, {
          render: 'Failed to generate meditation',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
      
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
      duration: `${duration} sec`,
    };

    try {
      addItem(newMeditation);
      toast.success('Meditation saved to your dashboard!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save meditation:', error);
      toast.error('Failed to save meditation. Please try again.');
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
                Duration: {formatTime(parseInt(duration))}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  disabled={isGenerating}
                  list="duration-markers"
                />
                <datalist id="duration-markers" className="flex justify-between w-full">
                  <option value="5" label="5s"></option>
                  <option value="10" label="10s"></option>
                  <option value="15" label="15s"></option>
                  <option value="30" label="30s"></option>
                  <option value="60" label="1m"></option>
                  <option value="120" label="2m"></option>
                  <option value="300" label="5m"></option>
                </datalist>
                <span className="text-amber-400 font-medium w-8 text-center">{formatTime(parseInt(duration))}</span>
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
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isGenerating
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 transform hover:scale-105 transition-transform'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  'Generate Meditation'
                )}
              </button>
            </div>
          </form>
        </div>

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

            {generatedMeditation?.audioUrl && (
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
                      {formatTime(currentTime * 1000)} / {formatTime(parseInt(duration) * 1000)}
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
                    if (progressInterval.current) {
                      clearInterval(progressInterval.current);
                    }
                  }}
                  onError={(e) => {
                    console.error('Audio playback error:', e);
                    toast.error('Error playing audio. The text-to-speech service might be unavailable.');
                  }}
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
