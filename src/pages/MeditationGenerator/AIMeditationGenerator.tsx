import React, { useState, useRef, useEffect } from "react";

import { generateMeditation, generateScript } from "../../services/aiMeditationService";
import { useAuth } from "../../contexts/AuthContext";
import "./AIMeditationGenerator.scss";
import { MedTypesAndAffirmations, PracticeTypes, mapDurationToWords } from "../../services/helpers";
import Popup from "../../components/Popup/Popup";
import LoadingScene from "../../components/LoadingScene/LoadingScene";
import { getMeditationItems, getUser } from "../../store/apiUtils";
import { setMeditations, createToast } from "../../store/contentSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { profanityFilter } from "./helper";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import { trackCTA } from "../../utils/analytics";
import VoiceOptions from "../../components/VoiceOptions/VoiceOptions";
import jordan from "../../assets/audio/Jordan.mp3";
import willow from "../../assets/audio/Willow.mp3";

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
  isImmersive: boolean;
}

const voiceOptionsArray = [
  { id: "en-GB-OliviaNeural", label: "Willow", sampleUri: willow },
  { id: "en-GB-OllieMultilingualNeural", label: "Jordan", sampleUri: jordan },
];

const AIMeditationGenerator: React.FC = () => {
  // State management
  const [meditationType, setMeditationType] = useState("Mindfulness");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [practiceType, setPracticeType] = useState(PracticeTypes[0].name);
  const allowedValues = Object.keys(mapDurationToWords);
  const [voice, setVoice] = useState(voiceOptionsArray[0]);
  const [duration, setDuration] = useState(allowedValues[0]);
  const [durationIndex, setDurationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const [showPopup, setShowPopup] = useState("");
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [immersive, setImmersive] = useState(true);
  const cost = immersive ? 2 : 1;

  const checkCredits = async () => {
    if (!currentUser) return;
    const user = await getUser(currentUser.uid);
    console.log(user);
    setCurrentUser(user);
    const { meditationCredits, extraBespokeMeditationCredits } = user?.subscription || {};
    return meditationCredits + extraBespokeMeditationCredits;
  };

  useEffect(() => {
    setDuration(allowedValues[durationIndex]);
  }, [durationIndex]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    // Reset any existing meditation
    setGeneratedMeditation(null);
    setIsGenerating(true);
    trackCTA("Generate Bespoke");
    e.preventDefault();
    if (isGenerating || !currentUser) return;

    // update user details and return early and alert user if they have used credits on another device.
    const credit = await checkCredits();
    if (!credit)
      return dispatch(
        createToast({
          text:
            "You do not currently have enough credit.  Please purchase a topup pack or wait for your subscription to renew.",
          type: "error",
        })
      );

    try {
      dispatch(createToast({ text: "Preparing your meditation", type: "info" }));
      const script = await generateScript(meditationType, duration, selectedLanguage, practiceType, title, immersive);
      dispatch(createToast({ text: "Applying your affirmations", type: "info" }));
      const result = await generateMeditation(
        meditationType,
        duration,
        selectedLanguage,
        practiceType,
        currentUser?.uid || "anonymous",
        voice.id,
        title,
        immersive,
        script.data || ""
      );

      console.log(result);
      if (!result) {
        dispatch(
          createToast({ text: "We were unable to generate your meditation. Please try again later.", type: "error" })
        );
        throw new Error("Failed to generate meditation");
      }

      if (result.message) {
        dispatch(createToast({ text: result.message, type: "success" }));
      }

      if (currentUser?.subscription?.meditationCredits + currentUser.subscription?.extraBespokeMeditationCredits < cost)
        return;
      if (
        currentUser &&
        (currentUser.subscription?.meditationCredits || currentUser?.subscription?.extraBespokeMeditationCredits)
      )
        if (currentUser.subscription?.meditationCredits >= cost) {
          updateUser(currentUser?.uid, {
            subscription: {
              ...currentUser?.subscription,
              meditationCredits: currentUser?.subscription?.meditationCredits - cost,
            },
          });
          setCurrentUser({
            ...currentUser,
            subscription: {
              ...currentUser?.subscription,
              meditationCredits: currentUser?.subscription?.meditationCredits - cost,
            },
          });
        } else if (
          cost === 2 &&
          currentUser.subscription?.meditationCredits === 1 &&
          currentUser?.subscription?.extraBespokeMeditationCredits
        ) {
          updateUser(currentUser?.uid, {
            subscription: {
              ...currentUser?.subscription,
              meditationCredits: 0,
              extraBespokeMeditationCredits: currentUser?.subscription?.extraBespokeMeditationCredits - 1,
            },
          });
          setCurrentUser({
            ...currentUser,
            subscription: {
              ...currentUser?.subscription,
              meditationCredits: 0,
              extraBespokeMeditationCredits: currentUser?.subscription?.extraBespokeMeditationCredits - 1,
            },
          });
        } else if (
          !currentUser.subscription?.meditationCredits &&
          currentUser?.subscription?.extraBespokeMeditationCredits >= cost
        ) {
          updateUser(currentUser?.uid, {
            subscription: {
              ...currentUser?.subscription,
              meditationCredits: 0,
              extraBespokeMeditationCredits: currentUser?.subscription?.extraBespokeMeditationCredits - cost,
            },
          });
          setCurrentUser({
            ...currentUser,
            subscription: {
              ...currentUser?.subscription,
              extraBespokeMeditationCredits: currentUser?.subscription?.extraBespokeMeditationCredits - cost,
            },
          });
        }

      // Update the state with the new meditation
      setGeneratedMeditation({
        title: "ready",
        content: "script too long",
        audioUrl: "result.data.audioUrl",
        isImmersive: true,
      });
      getMeditationItems(currentUser.uid).then((data) => {
        if (data) dispatch(setMeditations(data));
      });
      if (!result.message) {
        dispatch(createToast({ text: `Meditation Generated Successfully.`, type: "success" }));
      }

      // Scroll to the generated content
      setTimeout(() => {
        const resultsElement = document.querySelector(".results-container");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Error generating meditation:", error);
      // dispatch(cradmeateToast({ text: `There was an error.  Please try again later.`, type: "error" }));
    } finally {
      setIsGenerating(false);
    }
  };

  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating) loadingRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isGenerating]);

  const titleRef = useRef(null);

  return (
    <div className='ai-meditation-generator'>
      <div className='generator-header'>
        <h1>Bespoke Meditation Generator</h1>
        <p className='text-white'>
          Create a personalised meditation session tailored to your needs. Select your preferences below and let our
          Bespoke Meditation Generator craft the perfect guided meditation for you.
        </p>
      </div>
      {isGenerating && (
        <div ref={loadingRef}>
          {" "}
          <LoadingScene />
        </div>
      )}
      {!isGenerating && (
        <form onSubmit={handleSubmit} className='generator-form'>
          <div className='form-group'>
            <label>Title</label>
            {profanityFilter(title) && (
              <p className='ai-meditation-generator__warning'>Title must not contain profanities</p>
            )}
            <input
              ref={titleRef}
              value={title}
              placeholder='Enter a title'
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='form-group form-group-block'>
            <label htmlFor='duration'>Meditation Size: {allowedValues[durationIndex]}</label>

            <VoiceOptions
              selectedId={duration}
              onSelect={(e) => setDuration(e.id)}
              options={allowedValues.map((option) => ({
                id: option,
                label: option,
                sampleUri: "",
                description: mapDurationToWords[option].description,
              }))}
            />
          </div>
          <div className='form-group form-group-block'>
            <label>With Immersive Sound? </label>
            <span className='credit-count'>Voice only: 1 credit, Immersive: 2 credits </span>
            <ToggleSwitch checked={immersive} onChange={setImmersive} />
          </div>
          <div className='form-group form-group-block'>
            <label>Select a Voice </label>
            <VoiceOptions selectedId={voice.id} onSelect={setVoice} options={voiceOptionsArray} />
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
                  <option key={"med-type" + type.title + i} value={type.type}>
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
                    <div className='popup__list-item' key={`med-type-description - ${type.name}${i}`}>
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
                  <option key={"practice-type-" + lang.name + i} value={lang.name}>
                    <p> {lang.name}</p>
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex justify-center mt-8 space-x-8'>
            {currentUser?.subscription?.meditationCredits + currentUser?.subscription?.extraBespokeMeditationCredits <
              cost && (
              <span>
                You have run out of meditation credits for this subscription period. You can always topup using the link
                above and continue generating bespoke meditations.
              </span>
            )}
            {currentUser &&
            (currentUser?.subscription.subId !== "reszen8-core" ||
              currentUser?.subscription?.meditationCredits + currentUser?.subscription?.extraBespokeMeditationCredits >=
                cost) ? (
              <button
                type='submit'
                className='generate-btn'
                disabled={
                  isGenerating ||
                  !title ||
                  profanityFilter(title) ||
                  currentUser?.subscription?.meditationCredits +
                    currentUser?.subscription?.extraBespokeMeditationCredits <
                    cost
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
              <>
                <div className='signup-prompt'>
                  <p>
                    {" "}
                    Experience the magic of generating bespoke, unique meditations wherever and whenever you want, - to
                    save and listen whenever you want.
                  </p>
                  <Link className='signup-prompt__link' to='/memberships'>
                    {" "}
                    Sign Up Today{" "}
                  </Link>
                </div>
              </>
            )}
          </div>
        </form>
      )}

      {generatedMeditation && (
        <div className='results-container'>
          <div className='meditation-content'>
            <h2 className='text-2xl font-bold mb-6 text-orange-400'>{generatedMeditation?.title}</h2>
            <div className='audio-player bg-gray-800 rounded-lg p-6'>
              <div className='player-controls'>
                <div className='next-steps-container '>
                  <span className='next-steps'>
                    You can now enjoy your meditation in Your Journey, or click the Start Again button to generate
                    another.
                  </span>
                  <span>
                    <Link className='btn' style={{ marginRight: 8 }} to='/journey'>
                      Go to Your Journey
                    </Link>
                  </span>
                  <button
                    onClick={() => {
                      setTitle("");
                      window.scrollTo({ top: 0 });
                      titleRef?.current?.focus();
                    }}
                  >
                    Start Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMeditationGenerator;
