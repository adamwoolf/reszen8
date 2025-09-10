import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { generateMeditation } from "../../services/aiMeditationService";
import { useAuth } from "../../contexts/AuthContext";
import "./AIMeditationGenerator.scss";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "../../services/helpers";
import Popup from "./Popup";
import LoadingScene from "../../components/LoadingScene/LoadingScene";
import { getMeditationItemsREST, getStaticMeditationsREST } from "../../store/storeListener";
import { setMeditations, setStaticMeditations } from "../../store/contentSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { profanityFilter } from "./helper";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import AudioController from "../../components/AudioPlayer/AudioController";
interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
  isImmersive: boolean;
}

const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("Mindfulness");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [practiceType, setPracticeType] = useState(PracticeTypes[0].name);
  const allowedValues = Object.keys(mapDurationToWords);

  const [duration, setDuration] = useState(allowedValues[0]);
  const [durationIndex, setDurationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const { currentUser, updateUser } = useAuth();
  const [showPopup, setShowPopup] = useState("");
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [immersive, setImmersive] = useState(false);

  // Static Med generation data
  const [voiceCode, setVoiceCode] = useState("en-GB-BellaNeural");

  useEffect(() => {
    setDuration(allowedValues[durationIndex]);
  }, [durationIndex]);

  useEffect(() => {
    setVoiceCode(!immersive ? "en-GB-BellaNeural" : "en-GB-OliviaNeural");
  }, [immersive]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    // Reset any existing meditation
    setGeneratedMeditation(null);
    setIsGenerating(true);

    try {
      const result = await generateMeditation(
        meditationType,
        duration,
        selectedLanguage,
        practiceType,
        currentUser?.uid || "anonymous",
        voiceCode,
        title,
        immersive
      );
      const cost = immersive ? 2 : 1;
      console.log("Meditation generation result:", result);
      if (currentUser && currentUser.subscription?.meditationCredits)
        updateUser(currentUser?.uid, {
          subscription: {
            ...currentUser?.subscription,
            meditationCredits: currentUser?.subscription?.meditationCredits - cost,
          },
        });
      if (!result) {
        throw new Error("Failed to generate meditation");
      }

      // Update the state with the new meditation
      setGeneratedMeditation({
        title: result.data.script.title,
        content: result.data.script.content,
        audioUrl: result.data.audioUrl,
        isImmersive: result.data.dbItem.immersive,
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
              <Popup fitContent show={!!showPopup} onClose={() => setShowPopup("")}>
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
          <div className='form-group form-group-block'>
            <label>With Immersive Sound? </label>
            <ToggleSwitch checked={immersive} onChange={setImmersive} />
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
                <Popup fitContent show={showPopup} onClose={() => setShowPopup("")}>
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
            {!currentUser?.subscription?.meditationCredits && (
              <span>You have run out of meditation credits for this subscription period.</span>
            )}
            {currentUser && currentUser?.isGod ? (
              <button
                type='submit'
                className='generate-btn'
                disabled={
                  isGenerating || !title || profanityFilter(title) || !currentUser?.subscription?.meditationCredits
                }
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
                {isAudioGenerating ? (
                  <div className='spinner-small'></div>
                ) : generatedMeditation.audioUrl ? (
                  <AudioController
                    audioUrl={generatedMeditation.audioUrl}
                    isImmersive={generatedMeditation.isImmersive}
                  />
                ) : null}
              </div>

              <div className='flex justify-center mt-10 space-x-8'>
                <span className='message'>
                  Your meditation has been saved to the Bespoke Meditations tab in your
                  <Link to='/dashboard'>Dashboard</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMeditationGenerator;
