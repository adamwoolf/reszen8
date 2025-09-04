import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { v4 as uuidv4 } from "uuid";
import { generateMeditation, generateScript, generateStaticMedFromScript } from "../../services/aiMeditationService";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./AIMeditationGenerator.scss";
import ScriptLab from "../../components/ScriptLab";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "../../services/helpers";
import Popup from "./Popup";
import LoadingScene from "../../components/LoadingScene/LoadingScene";
import { getMeditationItemsREST, getStaticMeditationsREST } from "../../store/storeListener";
import { setMeditations, setStaticMeditations } from "../../store/contentSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { profanityFilter } from "./helper";
interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
}

const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("Mindfulness");
  // const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [practiceType, setPracticeType] = useState(PracticeTypes[0].name);
  const allowedValues = Object.keys(mapDurationToWords);

  const [duration, setDuration] = useState(allowedValues[0]);
  const [durationIndex, setDurationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const { currentUser } = useAuth();
  const [showPopup, setShowPopup] = useState("");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Static Med generation data
  const [script, setScript] = useState("");
  const [voiceCode, setVoiceCode] = useState("en-GB-BellaNeural");
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

  useEffect(() => {
    setDuration(allowedValues[durationIndex]);
  }, [durationIndex]);

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
        // toast.error("Failed to play audio. Please try again.");
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
    // const toastId = toast.loading("Generating your meditation...");

    try {
      const result = await generateMeditation(
        meditationType,
        duration,
        selectedLanguage,
        practiceType,
        currentUser?.uid || "anonymous",
        voiceCode,
        title
      );

      console.log("Meditation generation result:", result);

      if (!result) {
        throw new Error("Failed to generate meditation");
      }

      // Update the state with the new meditation
      setGeneratedMeditation({
        title: result.data.script.title,
        content: result.data.script.content,
        audioUrl: result.data.audioUrl,
      });
      getMeditationItemsREST().then((data) => {
        if (data) dispatch(setMeditations(data));
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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='ai-meditation-generator'>
      <div className='generator-header'>
        <h1>Bespoke Meditation Generator</h1>
        <p className='text-white'>
          Create a personalised meditation session tailored to your needs. Select your preferences below and let our
          Bespoke Meditation Generator craft the perfect guided meditation for you.
        </p>
      </div>
      {isGenerating && <LoadingScene />}
      {!isGenerating && (
        <form onSubmit={handleSubmit} className='generator-form'>
          <div className='form-group'>
            <label>Title</label>
            {profanityFilter(title) && (
              <p className='ai-meditation-generator__warning'>Title must not contain profanities</p>
            )}
            <input value={title} placeholder='Enter a title' onChange={(e) => setTitle(e.target.value)} />
            <label htmlFor='duration'>Meditation Size: {allowedValues[durationIndex]}</label>
            <button type='button' onClick={() => setShowPopup("size")} className='btn--text'>
              learn more
            </button>
            {showPopup === "size" && (
              <Popup show={!!showPopup} onClose={() => setShowPopup("")}>
                {Object.keys(mapDurationToWords).map((key) => {
                  const type = mapDurationToWords[key as keyof typeof mapDurationToWords];
                  return (
                    <div className='popup__list-item' key={`list-item-${key}`}>
                      <h4 className='popup__list-title'>{key}</h4>
                      <p className='popup__list-desc'>{type.description}</p>
                    </div>
                  );
                })}
              </Popup>
            )}
            <input
              className='custom-slider'
              type='range'
              min={0}
              max={allowedValues.length - 1}
              step={1}
              value={durationIndex}
              onChange={(e) => setDurationIndex(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div className='slider-markers'>
              {allowedValues.map((value, index) => (
                <span key={`marker ${index}`} className='marker'>
                  {value}
                </span>
              ))}
            </div>
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
                <button type='button' onClick={() => setShowPopup("practiceType")} className='btn--text'>
                  learn more
                </button>
              </div>
              {showPopup === "practiceType" && (
                <Popup show={showPopup} onClose={() => setShowPopup("")}>
                  {PracticeTypes.map((type, i) => (
                    <div className='popup__list-item' key={`${type.name}${i}`}>
                      <h4 className='popup__list-title'>{type.name}</h4>
                      <p className='popup__list-desc'>{type.description}</p>
                    </div>
                  ))}
                </Popup>
              )}
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
          </div>

          <div className='flex justify-center mt-8 space-x-8'>
            {currentUser && currentUser?.isGod ? (
              <button
                type='submit'
                className='generate-btn'
                disabled={isGenerating || !title || profanityFilter(title)}
              >
                {isGenerating ? (
                  <>
                    <span className='spinner'></span>
                    Generating...
                  </>
                ) : (
                  "Generate Meditation"
                )}
              </button>
            ) : (
              <span>Coming soon - generate bespoke, unique meditations to save and listen whenever you want.</span>
            )}
          </div>
        </form>
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
                  <div className='progress-bar bg-gray-700 rounded-full h-2 w-full overflow-hidden'>
                    <div
                      className='progress bg-orange-500 h-full transition-all duration-300'
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className='flex justify-center mt-10 space-x-8'>
                <span className='message'>
                  Your meditation has been saved to the Bespoke Meditations tab in your{" "}
                  <Link to='/dashboard'>Dashboard</Link>
                </span>
              </div>

              {/* {!currentUser && (
                <p className='text-sm text-gray-400 mt-4 text-center'>
                  <button onClick={() => navigate("/login")} className='text-orange-400 hover:underline'>
                    Sign in
                  </button>{" "}
                  to save this meditation to your dashboard
                </p>
              )} */}

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
                  // toast.error("Error playing audio. The text-to-speech service might be unavailable.");
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
