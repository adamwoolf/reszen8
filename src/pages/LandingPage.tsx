import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <div className="landing-page">
      <div className="logo-container" onClick={handleLogoClick}>
        <h1 className="logo">RESZEN8</h1>
        <p className="click-prompt">Click to enter</p>
      </div>
    </div>
  );
};

export default LandingPage;
