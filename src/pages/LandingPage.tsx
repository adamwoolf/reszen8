import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.scss";

const LandingPage: React.FC = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // navigate("/home");
    onClose();
  };

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
