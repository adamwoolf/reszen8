import React from "react";
import NewUserPlanPurchaseCta from "../../pages/Memberships/NewUserPlanPurchaseCta";
import { FaArrowCircleDown, FaSync, FaPlayCircle } from "react-icons/fa";
import Icon, { getIcon } from "../../components/Icon/Icon";
import { useSelector } from "react-redux";
import "./OnboardingPanel.scss";
import { Link } from "react-router-dom";
import AudioController from "../../components/AudioPlayer/AudioController";
import { usePlayer } from "../../contexts/AudioContext";

import { getStaticMeditations } from "../../store/contentSelectors";

const CreateMeditationOnboarding = ({ types = [], flip }: { types: any[]; flip: () => void }) => {
  const themes = useSelector((state) => state.content?.meditationThemes);
  const meds = useSelector(getStaticMeditations);

  const findMed = (type: string) => {
    console.log(type);
    const med = meds.find((med) => med.meditationType === type || med.meditationType === type.replace("and", "&"));
    console.log(med);
    return med;
  };

  if (!types?.length || !Array.isArray(types)) return null;

  return (
    <div className='onboarding-widget'>
      <button className='playlist__flip-cta' onClick={flip}>
        <FaSync />
      </button>
      <h3>Meditation, tuned to how you feel</h3>
      <p>Here's how RESZEN8 can support you</p>
      {Object.keys(getIcon)
        .filter((key) => key !== "Other")
        .filter((key) => types?.map((cat) => cat.replace(/\s+/g, "").toLowerCase()).includes(key.toLowerCase()))
        .slice(0, 1)
        .map((icon, index) => {
          const text = themes.find(
            (theme) => theme.title.replace(/\s+/g, "")?.toLowerCase() === icon.toLowerCase(),
          )?.description;
          return (
            <div className='onboarding-widget__result-card'>
              <div className='onboarding-widget__result-card-icon'>
                <Icon large type={icon} />
              </div>
              <div className='onboarding-widget__result-card-text'>
                <span>{text}</span>
              </div>
              <div className='onboarding-widget__result-card-audio'>
                <AudioController isImmersive playSample small audioUrl={findMed(types[index])?.audioUrl} />
              </div>
            </div>
          );
        })}
      {/* <NewUserPlanPurchaseCta homepage label='Try RESZEN8' /> */}
      <div className='create-widget__cta-container'>
        <Link to='/memberships' className='button'>
          Explore RESZEN8
          {/* <span className='onboarding__cta-icon'>
          <FaArrowCircleDown />
        </span> */}
        </Link>
      </div>
    </div>
  );
};

export default CreateMeditationOnboarding;
