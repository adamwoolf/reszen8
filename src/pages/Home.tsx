import React from 'react';
import PillarsCarousel from '../components/PillarsCarousel';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="carousel-container">
        <PillarsCarousel />
      </div>
    </div>
  );
};

export default Home;
