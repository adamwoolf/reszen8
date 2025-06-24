import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import { v4 as uuidv4 } from "uuid";
import { generateMeditation } from "../services/aiMeditationService";
import { convertTextToSpeech, VOICE_OPTIONS } from "../services/ttsService";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "./AIMeditationGenerator.scss";

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
}

const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("mindfulness");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [duration, setDuration] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const { currentUser } = useAuth();

  const [selectedMusic, setSelectedMusic] = useState<string>("none");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { addItem, savedItems } = useSavedItems();
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

  const durations = ["5", "10"];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
  ];

  const musicOptions = [
    {
      value: "none",
      label: "No background music",
      url: "",
    },
    {
      value: "ambient",
      label: "Ambient Soundscape",
      url: "https://assets.mixkit.co/active_storage/sfx/2585/2585-preview.mp3", // Calm ambient music
    },
    {
      value: "rain",
      label: "Gentle Rain",
      url: "https://assets.mixkit.co/active_storage/sfx/161/161-preview.mp3", // Rain sound
    },
    {
      value: "ocean",
      label: "Ocean Waves",
      url: "https://assets.mixkit.co/active_storage/sfx/80/80-preview.mp3", // Ocean waves
    },
    {
      value: "forest",
      label: "Forest Sounds",
      url: "https://assets.mixkit.co/active_storage/sfx/2583/2583-preview.mp3", // Forest ambiance
    },
    {
      value: "singing-bowl",
      label: "Singing Bowls",
      url: "https://assets.mixkit.co/active_storage/sfx/2587/2587-preview.mp3", // Singing bowl
    },
    {
      value: "white-noise",
      label: "White Noise",
      url: "https://assets.mixkit.co/active_storage/sfx/80/80-preview.mp3", // White noise
    },
  ];

  // Get filtered voices based on selected language
  const filteredVoices = VOICE_OPTIONS.filter((voice) => voice.supportedLanguages.includes(selectedLanguage));

  // Reset selected voice if it's not in the filtered list
  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.some((voice) => voice.id === selectedVoice)) {
      setSelectedVoice(filteredVoices[0].id);
    }
  }, [selectedLanguage, filteredVoices]);

  // Format time in seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [generatedMeditation, previewAudio]);

  useEffect(() => {
    const testMusicUrls = async () => {
      for (const music of musicOptions) {
        if (music.value !== "none" && music.url) {
          try {
            const response = await fetch(music.url, { method: "HEAD" });
          } catch (error) {
            console.error(`Error accessing ${music.label}:`, error);
          }
        }
      }
    };

    testMusicUrls();
  }, []);

  const handleMusicChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMusic(value);

    // Stop any currently playing preview
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setIsMusicPlaying(false);
    }

    // Play preview of selected music
    if (value !== "none") {
      const music = musicOptions.find((m) => m.value === value);
      if (music?.url) {
        try {
          const audio = new Audio(music.url);
          audio.volume = 0.3;
          audio.loop = true;
          await audio.play();
          setPreviewAudio(audio);
          setIsMusicPlaying(true);
        } catch (error) {
          console.error("Error playing music preview:", error);
          toast.error("Failed to play music preview");
        }
      }
    }
  };

  const playMeditationWithMusic = async (meditationAudioUrl: string) => {
    console.log("Starting playMeditationWithMusic with:", { meditationAudioUrl, selectedMusic });

    // Stop any preview that might be playing
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setIsMusicPlaying(false);
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("AudioContext created");

      // Load meditation audio
      const [meditationBuffer, musicBuffer] = await Promise.all([
        fetch(meditationAudioUrl)
          .then((r) => {
            console.log("Fetched meditation audio, status:", r.status);
            return r.arrayBuffer();
          })
          .then((b) => {
            console.log("Decoding meditation audio");
            return audioContext.decodeAudioData(b);
          }),
        (async () => {
          if (selectedMusic === "none") {
            console.log("No background music selected");
            return null;
          }

          const music = musicOptions.find((m) => m.value === selectedMusic);
          console.log("Selected music:", music);

          if (!music?.url) {
            console.log("No music URL found");
            return null;
          }

          try {
            console.log("Fetching music from:", music.url);
            const response = await fetch(music.url);
            console.log("Music fetch response status:", response.status);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const buffer = await response.arrayBuffer();
            console.log("Decoding music buffer");
            return audioContext.decodeAudioData(buffer);
          } catch (e) {
            console.error("Error loading music:", e);
            toast.error("Failed to load background music");
            return null;
          }
        })(),
      ]);

      console.log("Audio buffers loaded", {
        meditationBuffer: !!meditationBuffer,
        musicBuffer: !!musicBuffer,
      });

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
      const startTime = audioContext.currentTime + 0.1;
      if (musicSource) {
        musicSource.start(startTime);
        console.log("Started music playback");
      }
      meditationSource.start(startTime);
      console.log("Started meditation playback");

      // Return cleanup function
      return () => {
        try {
          console.log("Cleaning up audio");
          meditationSource.stop();
          if (musicSource) musicSource.stop();
          audioContext.close();
        } catch (e) {
          console.error("Error cleaning up audio:", e);
        }
      };
    } catch (error) {
      console.error("Error in playMeditationWithMusic:", error);
      toast.error("Failed to play meditation with background music");
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
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration || parseInt(duration) * 1000; // Fallback to selected duration if duration is not available
        const currentProgress = (currentTime / duration) * 100;

        setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        setCurrentTime(currentTime);

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

    // Get the selected voice details
    const selectedVoiceDetails = VOICE_OPTIONS.find((voice) => voice.id === selectedVoice);
    console.log("Selected voice details:", selectedVoiceDetails);

    // Reset any existing meditation
    setGeneratedMeditation(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating your meditation...");

    try {
      const result = await generateMeditation(
        meditationType,
        duration,
        selectedLanguage,
        selectedVoice, // Pass the selected voice ID
        currentUser?.uid || "anonymous"
      );

      console.log("Meditation generation result:", result);

      if (!result) {
        throw new Error("Failed to generate meditation");
      }

      // Ensure we have the required data
      if (!result.title || !result.content) {
        throw new Error("Incomplete meditation data received");
      }

      // Update the state with the new meditation
      setGeneratedMeditation({
        title: result.title,
        content: result.content,
        audioUrl: result.audioUrl,
      });

      // Show success message
      toast.update(toastId, {
        render: "Meditation generated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Scroll to the generated content
      setTimeout(() => {
        const resultsElement = document.querySelector(".results-container");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Error generating meditation:", error);
      toast.update(toastId, {
        render: "Failed to generate meditation. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle saving to dashboard
  const handleSaveToDashboard = () => {
    if (!generatedMeditation || !currentUser) return;

    const newItem = {
      id: Date.now(),
      title: generatedMeditation.title,
      type: "meditation" as const,
      duration: duration,
      savedDate: new Date().toISOString(),
      audioUrl: generatedMeditation.audioUrl,
      content: generatedMeditation.content,
    };

    addItem(newItem);
    toast.success("Saved to your dashboard");
  };

  // Function to reset the form
  const handleStartOver = () => {
    setGeneratedMeditation(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  // Handle music playback when selection changes
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = null;
    }

    if (selectedMusic !== "none") {
      // In a real app, you would load the actual music file here
      // For now, we'll just log the selection
      console.log("Selected music:", selectedMusic);

      // Example of how you might play the music:
      // const audio = new Audio(`/sounds/${selectedMusic}.mp3`);
      // audio.loop = true;
      // audio.volume = 0.3; // Lower volume for background music
      // audio.play();
      // musicAudioRef.current = audio;
    }
  }, [selectedMusic]);

  return (
    <div className='ai-meditation-generator'>
      <div className='generator-header'>
        <h1>Bespoke Meditation Generator</h1>
        <p className='text-white'>
          Create a personalized meditation session tailored to your needs. Select your preferences below and let our AI
          craft the perfect meditation for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='generator-form'>
        <div className='form-grid'>
          <div className='form-group'>
            <label htmlFor='background-music'>Background Music</label>
            <select id='background-music' value={selectedMusic} onChange={handleMusicChange} disabled={isGenerating}>
              {musicOptions.map((music) => (
                <option key={music.value} value={music.value}>
                  {music.label}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='meditation-type'>Meditation Type</label>
            <select
              id='meditation-type'
              value={meditationType}
              onChange={(e) => setMeditationType(e.target.value)}
              disabled={isGenerating}
            >
              {meditationTypes.map((type, i) => (
                <option key={type.value + i} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='duration'>Duration (seconds)</label>
            <select
              id='duration'
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isGenerating}
            >
              {durations.map((dur, i) => (
                <option key={dur + i} value={dur}>
                  {dur} sec
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='language'>Language</label>
            <select
              id='language'
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isGenerating}
            >
              {languageOptions.map((lang, i) => (
                <option key={lang.value + i} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='voice'>Voice</label>
            <select
              id='voice'
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isGenerating || filteredVoices.length === 0}
            >
              {filteredVoices.length === 0 ? (
                <option value=''>
                  No voices available for{" "}
                  {languageOptions.find((lang) => lang.value === selectedLanguage)?.label || "selected language"}
                </option>
              ) : (
                filteredVoices.map((voice, i) => (
                  <option key={voice.id + i} value={voice.id}>
                    {voice.name} - {voice.gender} ({voice.style})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className='flex justify-center mt-8 space-x-8'>
          <button type='submit' className='generate-btn' disabled={isGenerating}>
            {isGenerating ? (
              <>
                <span className='spinner'></span>
                Generating...
              </>
            ) : (
              "Generate Meditation"
            )}
          </button>
        </div>
      </form>

      {isGenerating && (
        <div className='loading-animation'>
          <div className='spinner'></div>
          <p>Creating your personalized meditation...</p>
        </div>
      )}

      {generatedMeditation && (
        <div className='results-container'>
          <div className='meditation-content'>
            <h2 className='text-2xl font-bold mb-6 text-orange-400'>{generatedMeditation?.title}</h2>
            <div className='audio-player bg-gray-800 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-orange-400'>Preview Your Meditation</h3>
              <div className='player-controls'>
                <div
                  className='play-btn'
                  role='button'
                  onClick={togglePlayPause}
                  disabled={isAudioGenerating}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isAudioGenerating ? (
                    <div className='spinner-small'></div>
                  ) : isPlaying ? (
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>

                <div className='progress-container flex-1 ml-4'>
                  <div className='time-display flex justify-between text-sm text-gray-400 mb-1'>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(parseInt(duration))}</span>
                  </div>
                  <div className='progress-bar bg-gray-700 rounded-full h-2 w-full overflow-hidden'>
                    <div
                      className='progress bg-orange-500 h-full transition-all duration-300'
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className='flex justify-center mt-10 space-x-8'>
                {/* <button type='button' className='start-over-btn' onClick={handleStartOver}>
                  Start Over
                </button>
                <button className='generate-btn' onClick={handleSaveToDashboard} disabled={!currentUser}>
                  {savedItems.meditations.some((item) => item.title === generatedMeditation?.title)
                    ? "Saved to Dashboard"
                    : "Save to Dashboard"}
                </button> */}
                <span className='message'>Your meditation has been saved to the My Meditations tab in dashboard</span>
              </div>

              {!currentUser && (
                <p className='text-sm text-gray-400 mt-4 text-center'>
                  <button onClick={() => navigate("/login")} className='text-orange-400 hover:underline'>
                    Sign in
                  </button>{" "}
                  to save this meditation to your dashboard
                </p>
              )}

              <audio
                ref={audioRef}
                src={generatedMeditation?.audioUrl}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMeditationGenerator;
