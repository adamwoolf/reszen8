import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.scss";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleLogoClick = () => {
    sessionStorage.setItem("hideLandingpage", "true");
    setShow(false);
  };

  useEffect(() => {
    const shouldHide = !!sessionStorage.getItem("hideLandingpage");
    console.log(shouldHide);
    setShow(!shouldHide);
  }, []);

  if (!show) return null;

  return (
    <div className='landing-page'>
      <button className='logo-container' onClick={handleLogoClick}>
        <h1 className='logo'>RESZEN8</h1>
        <p className='click-prompt'>Click to enter</p>
      </button>
    </div>
  );
};

export default LandingPage;
