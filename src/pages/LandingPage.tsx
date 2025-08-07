import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.scss";

const LandingPage: React.FC = () => {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLogoClick = () => {
    sessionStorage.setItem("hideLandingpage", "true");
    setLeaving(true);
  };

  useEffect(() => {
    const shouldHide = !!sessionStorage.getItem("hideLandingpage");
    setShow(!shouldHide);
  }, []);

  const handleAnimationEnd = () => {
    if (leaving) setShow(false);
  };

  if (!show) return null;

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={!leaving ? "landing-page" : "landing-page landing-page--leaving"}
    >
      <button className='logo-container' onClick={handleLogoClick}>
        <h1 className='logo'>RESZEN8</h1>
        <p className='click-prompt'>Click to enter</p>
      </button>
    </div>
  );
};

export default LandingPage;
