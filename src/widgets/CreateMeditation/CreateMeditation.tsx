import React, { useState, useRef, useEffect } from "react";

import { generateMeditation, generateScript } from "../../services/aiMeditationService";
import { useAuth } from "../../contexts/AuthContext";
import "./CreateMeditationStyles.scss";
import { PracticeTypes, mapDurationToWords } from "../../services/helpers";
import LoadingScene from "../../components/LoadingScene/LoadingScene";
import { getMeditationItems, getUser } from "../../store/apiUtils";
import { setMeditations, createToast } from "../../store/contentSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import { trackCTA } from "../../utils/analytics";
import VoiceOptions from "../../components/VoiceOptions/VoiceOptions";
import jordan from "../../assets/audio/rune.mp3";
import willow from "../../assets/audio/Willow.mp3";
import Consult8 from "../../components/Consult8/Consult8";
import { profanityFilter } from "../../pages/MeditationGenerator/helper";
import logo from "../../assets/logoNew.png";
import FlippableCard from "../../components/FlippableCard/FlippableCard";
import CreateMeditationPlaylist from "./CreateMeditationPlaylist";
import CreateMeditationOnboarding from "./CreateMeditationOnboarding";
import { FaLock } from "react-icons/fa";

interface MeditationState {
  title: string;
  content: string;
  audioUrl?: string;
  cleanupAudio?: () => void;
  isImmersive: boolean;
}

const voiceOptionsArray = [
  { id: "en-GB-OliviaNeural", label: "Willow", sampleUri: willow },
  { id: "en-GB-OllieMultilingualNeural", label: "Rune", sampleUri: jordan },
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
  const [flipped, setFlipped] = useState(false);
  const [allTypes, setAllTypes] = useState([]);

  const calculateCost = () => {
    switch (duration) {
      case "Recharge":
        return 1;
      case "Refresh":
        return 2;
      case "Relax":
        return 3;
      default:
        return 0;
    }
  };

  const cost = calculateCost();

  const deductCost = () => {
    if (!currentUser) return;
    const { subscription } = currentUser || {};
    let includedMeditations = subscription?.meditationCredits || 0;
    let extraTokens = subscription?.extraBespokeMeditationCredits || 0;

    if (cost === 1 && includedMeditations) includedMeditations -= cost;
    if (cost === 1 && !includedMeditations && extraTokens) extraTokens -= cost;
    if (cost === 2 && extraTokens) extraTokens -= cost;
    if (cost === 3 && extraTokens) extraTokens -= cost;

    const newSubscription = {
      ...currentUser?.subscription,
      meditationCredits: includedMeditations,
      extraBespokeMeditationCredits: extraTokens,
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
        content,
      );
      if (!result) {
        dispatch(
          createToast({ text: "We were unable to generate your meditation. Please try again later.", type: "error" }),
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
    } catch (error) {
      // Failed to generate meditation
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedMeditation) setFlipped(true);
  }, [generatedMeditation]);

  const loadingRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef(null);

  const userHasEnoughTokens =
    (currentUser?.subscription?.meditationCredits || 0) +
      (currentUser?.subscription?.extraBespokeMeditationCredits || 0) >=
    cost;

  const includedMeds = currentUser?.subscription?.meditationCredits || 0;
  const medTokens = currentUser?.subscription?.extraBespokeMeditationCredits || 0;

  const getSizeIsLocked = (value: string): boolean => {
    if (value === "Recharge" && !includedMeds && !medTokens) return true;
    if ((value === "Refresh" || value === "Relax") && !medTokens) return true;
    if (value === "Refresh" && medTokens < 2) return true;
    if (value === "Relax" && medTokens < 3) return true;

    return false;
  };
  return (
    <FlippableCard
      height={640}
      flipped={flipped}
      front={
        <div className='create-widget__container'>
          <img className='create-widget__logo' src={logo} />
          <div className='create-widget__header'>
            <h1>Create Your Meditation</h1>
            {!isGenerating && <p className='text-white'>Select up to 3 emotions for a personalised meditation </p>}
          </div>
          {isGenerating ? (
            <div className='generator__loading create-widget__loading' ref={loadingRef}>
              <h3 className='generator__loading__text'>{loadingMessage}</h3> <LoadingScene slow />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className='create-widget__consultate'>
                <Consult8
                  returnAllTypes={!currentUser ? setAllTypes : undefined}
                  setMeditationType={setMeditationType}
                  reset={!flipped}
                />
              </div>
              <div className='create-widget__columns'>
                <div className={currentUser ? "form-group" : "form-group form-group--locked"}>
                  {!currentUser && (
                    <span className='form-group-lock'>
                      <FaLock color='orange' />
                    </span>
                  )}
                  <label className='create-widget__label'>Name your meditation</label>
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
                <div className={currentUser ? "form-group " : "form-group form-group--locked"}>
                  {!currentUser && (
                    <span className='form-group-lock'>
                      <FaLock color='orange' />
                    </span>
                  )}
                  <label className='create-widget__label'>With Immersive Sound? </label>
                  {/* <span className='create-widget__credit'>Voice only = 2 meditation tokens, Immersive = 3. </span> */}
                  <ToggleSwitch checked={immersive} onChange={setImmersive} />
                </div>
              </div>
              <div className='create-widget__columns'>
                <div className={currentUser ? "form-group" : "form-group form-group--locked "}>
                  {!currentUser && (
                    <span className='form-group-lock'>
                      <FaLock color='orange' />
                    </span>
                  )}
                  <label className='create-widget__label' htmlFor='duration'>
                    Select a Size
                  </label>
                  <div className='create-widget__size-select'>
                    <VoiceOptions
                      useLabelForActive
                      selectedId={duration === "Recharge" ? "Short" : duration === "Refresh" ? "Med" : "Long"}
                      onSelect={(value) => setDuration(value.id)}
                      options={allowedValues.map((value) => ({
                        locked: getSizeIsLocked(value),
                        id: value,
                        label: value === "Recharge" ? "Short" : value === "Refresh" ? "Med" : "Long",
                      }))}
                    />
                    {/* <small className='create-widget-disclaimer'>
                      Short meditations will deduct from your included meditations, and thereafter from any extra tokens
                      you may have purchased.
                    </small>
                    <small className='create-widget-disclaimer'>
                      When using tokens: Short:1 token, Medium: 2 and Long: 3
                    </small> */}
                  </div>
                </div>
                <div>
                  {duration !== "Relax" ? (
                    <div
                      className={
                        currentUser ? "form-group form-group-block" : "form-group form-group--locked form-group-block"
                      }
                    >
                      {!currentUser && (
                        <span className='form-group-lock'>
                          <FaLock color='orange' />
                        </span>
                      )}
                      <label className='create-widget__label'>Select a Voice </label>
                      <VoiceOptions
                        selectedId={voice.id}
                        onSelect={setVoice}
                        options={
                          duration !== "Relax"
                            ? voiceOptionsArray
                            : voiceOptionsArray.filter((item) => item.label === "Willow")
                        }
                      />
                    </div>
                  ) : (
                    <div className='form-group form-group-block'>
                      <label>Voice: Willow </label>
                    </div>
                  )}
                </div>
              </div>

              <div className='generator-cta create-widget__cta-container'>
                {!userHasEnoughTokens && currentUser && (
                  <span className='signup-prompt'>
                    You do not have sufficient meditation tokens. You can always topup using the link above and continue
                    generating bespoke meditations.
                  </span>
                )}
                {currentUser &&
                  (currentUser?.subscription?.active || currentUser?.subscription?.isActiveSub) &&
                  userHasEnoughTokens && (
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
                        "Get Meditation"
                      )}
                    </button>
                  )}
                {currentUser && (
                  <button onClick={() => setFlipped(true)} type='button'>
                    Playlist
                  </button>
                )}
                {/* {(!currentUser ||
                  (!currentUser?.subscription?.active && currentUser?.subscription?.subscription !== "free-trial")) && (
                  <Link className='button' to='/memberships'>
                    {" "}
                    Sign Up Today{" "}
                  </Link>
                )} */}
                {!currentUser && (
                  <button
                    disabled={!Array.isArray(allTypes)}
                    onClick={() => (Array.isArray(allTypes) ? setFlipped(true) : undefined)}
                    type='button'
                  >
                    Continue
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      }
      back={
        currentUser ? (
          <CreateMeditationPlaylist flipped={flipped} flip={() => setFlipped(false)} />
        ) : (
          <CreateMeditationOnboarding
            flip={() => {
              setFlipped(false);
              setAllTypes([]);
              setMeditationType("Mindfulness");
            }}
            types={allTypes?.slice(0, 3)}
          />
        )
      }
    />
  );
};

export default AIMeditationGenerator;
