import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import { v4 as uuidv4 } from "uuid";
import { generateMeditation } from "../services/aiMeditationService";
import { convertTextToSpeech, VOICE_OPTIONS } from "../services/ttsService";
import { toast } from "react-toastify";

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;  // Add this line
}
const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("mindfulness");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [duration, setDuration] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string>('none');

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { addItem } = useSavedItems();
  const navigate = useNavigate();

  // Constants
  const meditationTypes = [
    { value: "mindfulness", label: "Mindfulness" },
    { value: "sleep", label: "Sleep" },
    { value: "anxiety", label: "Anxiety Relief" },
    { value: "gratitude", label: "Gratitude" },
    { value: "focus", label: "Focus & Concentration" },
    { value: "loving-kindness", label: "Loving-Kindness" },
  ];

  const durations = ["5", "10", "15", "30", "60", "120", "300"];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
  ];

  const musicOptions = [
    { value: 'none', label: 'No background music' },
    { value: 'ambient', label: 'Ambient Soundscape' },
    { value: 'rain', label: 'Gentle Rain' },
    { value: 'ocean', label: 'Ocean Waves' },
    { value: 'forest', label: 'Forest Sounds' },
    { value: 'singing-bowl', label: 'Singing Bowls' },
    { value: 'white-noise', label: 'White Noise' },
  ];

  // Get filtered voices based on selected language
  const filteredVoices = VOICE_OPTIONS.filter(voice => 
    voice.supportedLanguages.includes(selectedLanguage)
  );

  // Reset selected voice if it's not in the filtered list
  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.some(voice => voice.id === selectedVoice)) {
      setSelectedVoice(filteredVoices[0].id);
    }
  }, [selectedLanguage, filteredVoices]);

  // Format time for display
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return secs === 0 ? `${mins} min` : `${mins}m ${secs}s`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up audio when component unmounts or meditation changes
      if (generatedMeditation?.cleanupAudio) {
        generatedMeditation.cleanupAudio();
      }
      if (generatedMeditation?.audioUrl) {
        URL.revokeObjectURL(generatedMeditation.audioUrl);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [generatedMeditation]);

  const playMeditationWithMusic = async (meditationAudioUrl: string) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load meditation audio
      const [meditationBuffer, musicBuffer] = await Promise.all([
        fetch(meditationAudioUrl).then(r => r.arrayBuffer()).then(b => audioContext.decodeAudioData(b)),
        selectedMusic !== 'none' 
          ? fetch(`/sounds/${selectedMusic}.mp3`)
              .then(r => {
                if (!r.ok) throw new Error('Failed to load background music');
                return r.arrayBuffer();
              })
              .then(b => audioContext.decodeAudioData(b))
              .catch(e => {
                console.error('Error loading music:', e);
                return null;
              })
          : Promise.resolve(null)
      ]);
  
      // Create meditation audio source
      const meditationSource = audioContext.createBufferSource();
      meditationSource.buffer = meditationBuffer;
      
      // Create music source if available
      let musicSource: AudioBufferSourceNode | null = null;
      if (musicBuffer) {
        musicSource = audioContext.createBufferSource();
        musicSource.buffer = musicBuffer;
        musicSource.loop = true;
        
        const musicGain = audioContext.createGain();
        musicGain.gain.value = 0.3; // Lower volume for background
        
        musicSource.connect(musicGain);
        musicGain.connect(audioContext.destination);
      }
      
      // Connect meditation audio to destination
      meditationSource.connect(audioContext.destination);
      
      // Start playback
      const startTime = audioContext.currentTime + 0.1; // Small delay to ensure everything is ready
      if (musicSource) musicSource.start(startTime);
      meditationSource.start(startTime);
      
      // Return cleanup function
      return () => {
        try {
          meditationSource.stop();
          if (musicSource) musicSource.stop();
          audioContext.close();
        } catch (e) {
          console.error('Error cleaning up audio:', e);
        }
      };
    } catch (error) {
      console.error('Error in playMeditationWithMusic:', error);
      toast.error('Failed to play meditation with background music');
      return () => {}; // Return empty cleanup function
    }
  };
  // Toggle play/pause for audio
  const togglePlayPause = async () => {
    if (!audioRef.current) return;
  
    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      try {
        // If we have a cleanup function, we're using the Web Audio API
        if (generatedMeditation?.cleanupAudio) {
          // The audio is already playing through Web Audio API
          // Just update the UI state
          setIsPlaying(true);
          startProgressTimer();
        } else {
          // Fallback to regular audio element
          await audioRef.current.play();
          startProgressTimer();
        }
      } catch (e) {
        console.error("Error playing audio:", e);
        toast.error("Failed to play audio. Please try again.");
      }
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
  
    console.log("Starting meditation generation...");
    console.log("Selected voice ID:", selectedVoice);
    console.log("Selected language:", selectedLanguage);
    console.log("Selected music:", selectedMusic);
    
    setIsGenerating(true);
  
    try {
      const toastId = toast.loading("Generating your meditation...");
  
      try {
        // Get the selected voice details
        const selectedVoiceDetails = VOICE_OPTIONS.find(voice => voice.id === selectedVoice);
        console.log("Selected voice details:", selectedVoiceDetails);
        
        // Create voice style prompt
        const voiceStylePrompt = selectedVoiceDetails 
          ? `Please use a ${selectedVoiceDetails.style} voice tone. `
          : '';
  
        // Generate meditation text
        console.log("Calling generateMeditation with:", { 
          meditationType, 
          duration, 
          language: selectedLanguage,
          voiceStyle: voiceStylePrompt 
        });
        
        const result = await generateMeditation(
          meditationType, 
          parseInt(duration, 10), 
          selectedLanguage,
          voiceStylePrompt
        );
        
        console.log("Meditation text generated successfully");
        
        // Generate audio with selected voice
        console.log("Generating audio with voice ID:", selectedVoice);
        setIsAudioGenerating(true);
        
        try {
          const audioUrl = await convertTextToSpeech(result.content, selectedVoice);
          console.log("Audio generation complete");
          
          // Create a blob URL for the audio
          const response = await fetch(audioUrl);
          const audioBlob = await response.blob();
          const audioBlobUrl = URL.createObjectURL(audioBlob);
          
          // Play the meditation with background music
          const cleanup = await playMeditationWithMusic(audioBlobUrl);
          
          // Update result with generated audio and cleanup function
          const resultWithAudio = {
            ...result,
            audioUrl: audioBlobUrl,
            cleanupAudio: cleanup
          };
  
          setGeneratedMeditation(resultWithAudio);
          toast.success("Meditation generated successfully!");
        } catch (audioError) {
          console.error("Error generating audio:", audioError);
          toast.error("Failed to generate audio. Please try again.");
          throw audioError;
        }
      } catch (error) {
        console.error("Error generating meditation:", error);
        toast.error(error instanceof Error ? error.message : 'Failed to generate meditation');
        throw error;
      } finally {
        toast.dismiss(toastId);
        setIsAudioGenerating(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Save meditation to dashboard
  const handleSaveToDashboard = async () => {
    if (!generatedMeditation) return;

    try {
      // Convert blob URL to data URL if it exists
      let audioDataUrl = generatedMeditation.audioUrl;
      
      if (audioDataUrl && audioDataUrl.startsWith('blob:')) {
        try {
          // Fetch the blob data
          const response = await fetch(audioDataUrl);
          const blob = await response.blob();
          
          // Convert blob to base64 data URL
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          audioDataUrl = dataUrl;
        } catch (error) {
          console.error('Error processing audio data:', error);
          toast.error('Failed to process audio data');
          return;
        }
      }

      const newMeditation = {
        id: Date.now(),
        title: generatedMeditation.title,
        audioUrl: audioDataUrl,
        type: 'meditation' as const,
        duration: `${duration} sec`,
        content: generatedMeditation.content,
        savedDate: new Date().toISOString()
      };

      const wasAdded = addItem(newMeditation);
      
      if (wasAdded) {
        toast.success("Meditation saved to your dashboard!");
        navigate("/dashboard");
      } else {
        toast.info("This meditation is already in your dashboard");
      }
    } catch (error) {
      console.error("Failed to save meditation:", error);
      toast.error("Failed to save meditation. Please try again.");
    }
  };

  // Handle music playback when selection changes
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = null;
    }

    if (selectedMusic !== 'none') {
      // In a real app, you would load the actual music file here
      // For now, we'll just log the selection
      console.log('Selected music:', selectedMusic);
      
      // Example of how you might play the music:
      // const audio = new Audio(`/sounds/${selectedMusic}.mp3`);
      // audio.loop = true;
      // audio.volume = 0.3; // Lower volume for background music
      // audio.play();
      // musicAudioRef.current = audio;
    }
  }, [selectedMusic]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24 pb-12 px-4'>
      <div className='container mx-auto max-w-4xl'>
        <h1 className='text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600'>
          AI Meditation Generator
        </h1>

        <div className='bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8 border border-gray-700'>
          <h2 className='text-2xl font-semibold mb-6 text-amber-400'>Create Your Custom Meditation</h2>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Meditation Type Selection */}
            <div>
              <label htmlFor='meditationType' className='block text-sm font-medium text-gray-300 mb-2'>
                Meditation Type
              </label>
              <select
                id='meditationType'
                value={meditationType}
                onChange={(e) => setMeditationType(e.target.value)}
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white'
                required
                disabled={isGenerating}
              >
                <option value=''>Select a meditation type</option>
                {meditationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label htmlFor='language' className='block text-sm font-medium text-gray-300 mb-2'>
                Language
              </label>
              <select
                id='language'
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white'
                disabled={isGenerating}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Selection */}
            <div>
              <label htmlFor='voiceType' className='block text-sm font-medium text-gray-300 mb-2'>
                Voice
              </label>
              <select
                id='voiceType'
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white'
                disabled={isGenerating || filteredVoices.length === 0}
              >
                {filteredVoices.length === 0 ? (
                  <option value=''>No voices available for {languageOptions.find(lang => lang.value === selectedLanguage)?.label || 'selected language'}</option>
                ) : (
                  filteredVoices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} - {voice.gender} ({voice.style})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Music Selection */}
            <div>
              <label htmlFor='musicType' className='block text-sm font-medium text-gray-300 mb-2'>
                Background Music (Optional)
              </label>
              <select
                id='musicType'
                value={selectedMusic}
                onChange={(e) => setSelectedMusic(e.target.value)}
                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-white'
                disabled={isGenerating}
              >
                {musicOptions.map((music) => (
                  <option key={music.value} value={music.value}>
                    {music.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Slider */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Duration: {formatTime(parseInt(duration))}
              </label>
              <div className='flex items-center space-x-4'>
                <input
                  type='range'
                  min='5'
                  max='300'
                  step='5'
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className='w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500'
                  disabled={isGenerating}
                  list='duration-markers'
                />
                <datalist id='duration-markers' className='flex justify-between w-full'>
                  <option value='5' label='5s'></option>
                  <option value='10' label='10s'></option>
                  <option value='15' label='15s'></option>
                  <option value='30' label='30s'></option>
                  <option value='60' label='1m'></option>
                  <option value='120' label='2m'></option>
                  <option value='300' label='5m'></option>
                </datalist>
                <span className='text-amber-400 font-medium w-8 text-center'>{formatTime(parseInt(duration))}</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isGenerating
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 transform hover:scale-105 transition-transform"
                }`}
              >
                {isGenerating ? (
                  <div className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  "Generate Meditation"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Content */}
        {generatedMeditation && (
          <div
            id='generated-content'
            className='bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700 transition-all duration-500 transform'
          >
            <div className='flex justify-between items-start mb-6'>
              <h2 className='text-2xl font-semibold text-amber-400'>{generatedMeditation.title}</h2>
              <button
                onClick={handleSaveToDashboard}
                className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center'
              >
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                  />
                </svg>
                Save to Dashboard
              </button>
            </div>

            <div className='prose prose-invert max-w-none mb-6'>
              <p className='whitespace-pre-line text-gray-200 leading-relaxed'>{generatedMeditation.content}</p>
            </div>

            {/* Audio Player */}
            {generatedMeditation?.audioUrl && (
              <div className='mt-8 bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600'>
                <div className='flex items-center mb-4'>
                  <button
                    onClick={togglePlayPause}
                    className='w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200'
                  >
                    {isPlaying ? (
                      <svg
                        className='w-6 h-6'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                    ) : (
                      <svg
                        className='w-6 h-6'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </button>
                  <div className='ml-4 flex-1'>
                    <div className='text-sm text-gray-300 mb-1'>
                      {formatTime(currentTime * 1000)} / {formatTime(parseInt(duration) * 1000)}
                    </div>
                    <div className='w-full bg-gray-600 rounded-full h-1.5'>
                      <div
                        className='bg-amber-500 h-1.5 rounded-full'
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
                    console.error("Audio playback error:", e);
                    toast.error("Error playing audio. The text-to-speech service might be unavailable.");
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