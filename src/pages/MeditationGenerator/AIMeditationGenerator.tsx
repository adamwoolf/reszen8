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
import Consult8 from "../../components/Consult8/Consult8";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationState | null>(null);
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [immersive, setImmersive] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");

  const cost = immersive ? 3 : 2;

  const deductCost = () => {
    const { subscription } = currentUser || {};
    if (!currentUser) return;

    const availableCredit = subscription?.meditationCredits + (subscription?.extraBespokeMeditationCredits || 0);
    if (cost > availableCredit) return;

    const remainder = subscription?.meditationCredits - cost;

    let planCreditAmount = 0;
    let splitAmount = 0;

    if (remainder >= 0) planCreditAmount = cost;

    if (remainder <= 0) {
      planCreditAmount = subscription?.meditationCredits || 0;
      splitAmount = Math.abs(remainder);
    }
    const newSubscription = {
      ...currentUser?.subscription,
      meditationCredits: (currentUser?.subscription?.meditationCredits || 0) - planCreditAmount,
      extraBespokeMeditationCredits: currentUser?.subscription?.extraBespokeMeditationCredits
        ? currentUser?.subscription?.extraBespokeMeditationCredits - splitAmount
        : 0,
    };
    updateUser(currentUser?.uid, {
      subscription: newSubscription,
    });

    setCurrentUser({
      ...currentUser,
      subscription: newSubscription,
    });
  };

  const checkCredits = async () => {
    if (!currentUser) return;
    const user = await getUser(currentUser.uid);

    setCurrentUser(user);
    const { meditationCredits, extraBespokeMeditationCredits } = user?.subscription || {};
    return meditationCredits + extraBespokeMeditationCredits;
  };

  useEffect(() => {
    setLoadingMessage(mapDurationToWords[duration].loadingMessage);
    if (duration === "Relax") setVoice(voiceOptionsArray[0]);
  }, [duration]);

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
          text: "You do not currently have enough credit.  Please purchase a topup pack or wait for your subscription to renew.",
          type: "error",
        })
      );

    try {
      const script = await generateScript(meditationType, duration, selectedLanguage, practiceType, title, immersive);
      const content = JSON.parse(script.data.body);

      const result = await generateMeditation(
        meditationType,
        duration,
        selectedLanguage,
        practiceType,
        currentUser?.uid || "anonymous",
        voice.id,
        title,
        immersive,
        content
      );
      if (!result) {
        dispatch(
          createToast({ text: "We were unable to generate your meditation. Please try again later.", type: "error" })
        );
        throw new Error("Failed to generate meditation");
      }

      if (result.message) {
        dispatch(createToast({ text: result.message, type: "success" }));
      }
      deductCost();
      if (currentUser?.subscription?.meditationCredits + currentUser.subscription?.extraBespokeMeditationCredits < cost)
        return;

      // Update the state with the new meditation
      setGeneratedMeditation({
        title: result?.data?.title,
        content: "script too long",
        audioUrl: result?.data?.audioUrl,
        isImmersive: result?.data?.immersive,
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
      // Failed to generate meditation
    } finally {
      setIsGenerating(false);
    }
  };

  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating) loadingRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isGenerating]);

  const titleRef = useRef(null);

  const userHasEnoughTokens =
    (currentUser?.subscription?.meditationCredits || 0) +
      (currentUser?.subscription?.extraBespokeMeditationCredits || 0) >=
    cost;

  return (
    <div className='ai-meditation-generator'>
      <div className='generator-header'>
        <h1>Bespoke Meditations</h1>
        <p className='text-white'>
          Reflective moments crafted by you. A guided meditation or a simple moment of clarity. Your choice...
        </p>
      </div>
      {isGenerating && (
        <div className='generator__loading' ref={loadingRef}>
          <h3 className='generator__loading__text'>{loadingMessage}</h3> <LoadingScene />
        </div>
      )}
      {!isGenerating && (
        <form onSubmit={handleSubmit} className='generator-form'>
          <Consult8 setMeditationType={setMeditationType} />

          <div className='form-group form-group-block'>
            <label htmlFor='duration'>Select a Size</label>
            {/* <small className='credit-count'>
              Depending on emotions selected (step 1) and size selected (step 2) meditation times will vary.
            </small> */}
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
            <span className='credit-count'>Voice only = 2 meditation tokens, Immersive = 3. </span>
            <ToggleSwitch checked={immersive} onChange={setImmersive} />
          </div>
          {duration !== "Relax" ? (
            <div className='form-group form-group-block'>
              <label>Select a Voice </label>
              <VoiceOptions
                selectedId={voice.id}
                onSelect={setVoice}
                options={
                  duration !== "Relax" ? voiceOptionsArray : voiceOptionsArray.filter((item) => item.label === "Willow")
                }
              />
            </div>
          ) : (
            <div className='form-group form-group-block'>
              <label>Voice: Willow </label>
            </div>
          )}
          <div className='form-group'>
            <label>Name your meditation</label>
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

          <div className='generator-cta'>
            {!userHasEnoughTokens && (
              <span className='signup-prompt'>
                You do not have sufficient meditation tokens. You can always topup using the link above and continue
                generating bespoke meditations.
              </span>
            )}
            {currentUser && currentUser?.subscription?.active && userHasEnoughTokens && (
              <button
                type='submit'
                className='generate-btn'
                disabled={isGenerating || !title || profanityFilter(title) || !userHasEnoughTokens}
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
            )}
            {(!currentUser || !currentUser?.subscription?.active) && (
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
