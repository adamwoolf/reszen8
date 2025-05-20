import React from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import './FloatingCTA.css';

const FloatingCTA = () => {
  return (
    <div className="floating-cta">
      <Link to="/contact" className="cta-button">
        <ChatBubbleOvalLeftIcon className="cta-icon" />
        <span className="cta-text">Contact Us</span>
      </Link>
    </div>
  );
};

export default FloatingCTA;
