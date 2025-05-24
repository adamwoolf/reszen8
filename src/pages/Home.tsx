import React from 'react';
import PillarsCarousel from '../components/PillarsCarousel';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="mission-statement">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p className="mission-text">
            At RESZEN8, we're dedicated to creating a harmonious balance between mind, body, and spirit through our premium wellness products and experiences. 
            Our mission is to provide tools and resources that help you find your center, reduce stress, and enhance your overall well-being in today's fast-paced world.
          </p>
          <p className="mission-tagline">
            Stillness. Strength. Presence.
          </p>
        </div>
      </section>
      <div className="carousel-container">
        <PillarsCarousel />
      </div>
    </div>
  );
};

export default Home;
