import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { v4 as uuidv4 } from "uuid";
import { generateMeditation, generateScript } from "../../services/aiMeditationService";
import { convertTextToSpeech, VOICE_OPTIONS } from "../../services/ttsService";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./AIMeditationGenerator.scss";
import ScriptLab from "../../components/ScriptLab";
import { MedTypesAndAffirmations, PracticeTypes } from "../../services/helpers";
import Popup from "./Popup";

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
}

const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("Mindfulness");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [practiceType, setPracticeType] = useState(PracticeTypes[0]);
  const allowedValues = [3, 5, 8, 10, 15];

  const [duration, setDuration] = useState(allowedValues[0]);
  const [durationIndex, setDurationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const { currentUser } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { addItem } = useSavedItems();
  const navigate = useNavigate();

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
  ];

  // Get filtered voices based on selected language
  const filteredVoices = VOICE_OPTIONS.filter((voice) => voice.supportedLanguages.includes(selectedLanguage));

  // Reset selected voice if it's not in the filtered list
  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.some((voice) => voice.id === selectedVoice)) {
      setSelectedVoice(filteredVoices[0].id);
    }
  }, [selectedLanguage, filteredVoices]);

  useEffect(() => {
    setDuration(allowedValues[durationIndex]);
  }, [durationIndex]);

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
        <div className='form-group'>
          <label htmlFor='duration'>Duration {allowedValues[durationIndex]} (minutes)</label>
          <input
            className='custom-slider'
            type='range'
            min={0}
            max={allowedValues.length - 1}
            step={1}
            value={durationIndex}
            onChange={(e) => setDurationIndex(Number(e.target.value))}
            style={{ width: "100%" }}
          />{" "}
        </div>
        <div className='form-grid'>
          <div className='form-group form-group-block'>
            <label htmlFor='meditation-type'>Meditation Type</label>
            <select
              id='meditation-type'
              value={meditationType}
              onChange={(e) => setMeditationType(e.target.value)}
              disabled={isGenerating}
            >
              {MedTypesAndAffirmations.map((type, i) => (
                <option key={type.title + i} value={type.type}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <div>
              <label htmlFor='practiceType'>Practice Type</label>
              <button type='button' onClick={() => setShowPopup(true)} className='btn--text'>
                learn more
              </button>
            </div>
            <Popup show={showPopup} onClose={() => setShowPopup(false)} />
            <select
              id='practiceType'
              value={practiceType.name}
              onChange={(e) => setPracticeType(e.target.value)}
              disabled={isGenerating}
            >
              {PracticeTypes.map((lang, i) => (
                <option key={lang.name + i} value={lang.name}>
                  <p> {lang.name}</p>
                </option>
              ))}
            </select>
          </div>

          {/* <div className='form-group'>
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
          </div> */}
        </div>

        <div className='flex justify-center mt-8 space-x-8'>
          {/* <button type='submit' className='generate-btn' disabled={isGenerating}>
            {isGenerating ? (
              <>
                <span className='spinner'></span>
                Generating...
              </>
            ) : (
              "Generate Meditation"
            )}
          </button> */}
        </div>
      </form>
      <ScriptLab
        duration={duration}
        selectedLanguage={selectedLanguage}
        meditationType={meditationType}
        practiceType={practiceType}
      />

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
