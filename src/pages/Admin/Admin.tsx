import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { v4 as uuidv4 } from "uuid";
import {
  generateMeditation,
  generateStaticMedFromScript,
  generateArticleWithAudio,
} from "../../services/aiMeditationService";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import ScriptLab from "../../components/ScriptLab";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "../../services/helpers";
import LoadingScene from "../../components/LoadingScene/LoadingScene";
import { getMeditationItems, getStaticMeditations } from "../../store/apiUtils";
import { setMeditations, setStaticMeditations } from "../../store/contentSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { profanityFilter } from "./helper";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
}

const Admin: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("Mindfulness");
  // const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [practiceType, setPracticeType] = useState(PracticeTypes[0].name);
  const allowedValues = Object.keys(mapDurationToWords);
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
  const [contentType, setContentType] = useState("meditation");
  const [immersive, setImmersive] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Static Med generation data
  const [script, setScript] = useState("");
  const [formattedArticle, setFormattedArticle] = useState("");
  const [voiceCode, setVoiceCode] = useState("en-GB-BellaNeural");
  // Hooks
  const { addItem } = useSavedItems();
  const navigate = useNavigate();

  // const languageOptions = [
  //   { value: "en", label: "English" },
  //   { value: "es", label: "Spanish" },
  //   { value: "fr", label: "French" },
  //   { value: "de", label: "German" },
  //   { value: "it", label: "Italian" },
  //   { value: "pt", label: "Portuguese" },
  // ];

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
    setVoiceCode(immersive ? "en-GB-OliviaNeural" : "en-GB-BellaNeural");
  }, [immersive]);

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

  const generateStatic = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      await generateStaticMedFromScript(title, meditationType, practiceType, script, voiceCode, immersive);

      console.log("Static generated");

      getStaticMeditations().then((data) => {
        if (data) dispatch(setStaticMeditations(data));
      });
    } catch (error) {
      console.error("Error generating meditation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateArticle = async () => {
    setIsGenerating(true);
    console.log("article", title, script, voiceCode, meditationType, practiceType);
    await generateArticleWithAudio(title, script, formattedArticle, voiceCode, meditationType, practiceType, immersive);
    setIsGenerating(false);
  };

  return (
    <div className='ai-meditation-generator'>
      {isGenerating && <LoadingScene />}

      {/* STATIC MED GEN  */}
      {currentUser && currentUser.isGod && (
        <div className='static-med-panel'>
          <h3>Static Med Gen </h3>

          <span style={{ position: "absolute", right: 100 }}>
            {isGenerating ? "api status: GENERATING" : "api status: idle"}
          </span>
          <label>Title</label>
          <input value={title} placeholder='Enter title for static med' onChange={(e) => setTitle(e.target.value)} />
          <div className='form-group form-group-block'>
            <label>Content type: Meditation or Article</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {["meditation", "article"].map((content) => (
                <option value={content}>{content}</option>
              ))}
            </select>
          </div>
          <div className='form-group form-group-block'>
            <label>With Immersive Sound? </label>
            <ToggleSwitch checked={immersive} onChange={setImmersive} />
          </div>
          <div className='form-group form-group-block'>
            <label>Voice code</label>
            <input value={voiceCode} placeholder='Enter voice code' onChange={(e) => setVoiceCode(e.target.value)} />
          </div>
          <div className='form-grid'>
            {contentType === "meditation" && (
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
            )}

            {contentType === "meditation" && (
              <div className='form-group'>
                <div>
                  <label htmlFor='practiceType'>Practice Type</label>
                </div>

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
            )}
          </div>
          <label>Script</label>
          <RichTextEditor
            onChange={(e) => {
              setScript(e.plainText);
              setFormattedArticle(e.html);
            }}
          />

          <button
            disabled={!title || !meditationType || !script || !practiceType}
            onClick={contentType === "meditation" ? generateStatic : generateArticle}
          >
            {isGenerating ? "GENERATING" : contentType === "meditation" ? "Generate Static Med" : "Generate Article"}
          </button>
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

export default Admin;
