import React, { useState } from "react";
import "./OnboardingHeroStyles.scss";
import Consult8 from "../Consult8/Consult8";
import NewUserPlanPurchaseCta from "../../pages/Memberships/NewUserPlanPurchaseCta";
import Icon, { getIcon } from "../Icon/Icon";
import { useSelector } from "react-redux";
import logo from "../../assets/logoNew.png";
import { FaArrowCircleDown } from "react-icons/fa";
const OnboardingHero = () => {
  const [category, setCategory] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const themes = useSelector((state) => state.content?.meditationThemes);

  const exploreClick = () => {
    const content = document.getElementById("freemium");

    content?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className='onboarding'>
      <img className='onboarding__logo' src={logo} />
      {!showResult ? (
        <div>
          <Consult8 header returnAllTypes={setCategory} />
          <div className='onboarding__ctas'>
            <NewUserPlanPurchaseCta homepage label='Try RESZEN8 for £0.99' />
            <button
              disabled={!Array.isArray(category) || !category.length}
              onClick={() => (category.length > 0 ? setShowResult(true) : null)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className='onboarding__result'>
          <h3>Meditation, tuned to how you feel</h3>
          <p>Here's how RESZEN8 can support you</p>
          {Object.keys(getIcon)
            .filter((key) => key !== "Other")
            .filter((key) => category.map((cat) => cat.replace(/\s+/g, "").toLowerCase()).includes(key.toLowerCase()))
            .map((icon) => {
              const text = themes.find(
                (theme) => theme.title.replace(/\s+/g, "")?.toLowerCase() === icon.toLowerCase(),
              )?.description;
              return (
                <div className='onboarding__result-card'>
                  <Icon large type={icon} />
                  <div>
                    <span>{text}</span>
                  </div>
                </div>
              );
            })}
          <NewUserPlanPurchaseCta homepage label='Try RESZEN8' />
          <button className='onboarding__cta-secondary' onClick={exploreClick}>
            Explore RESZEN8
            <span className='onboarding__cta-icon'>
              <FaArrowCircleDown />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingHero;
