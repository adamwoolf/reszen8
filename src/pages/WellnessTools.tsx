import React from 'react';
import './CategoryPage.css';

const WellnessTools: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Wellness Tools</h1>
        <p className="subtitle">Essential tools to support your mental and physical wellbeing</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>At RESZEN8, we carefully curate wellness tools that enhance your mindfulness practice and support your journey to balance. Each item is selected for its quality, effectiveness, and alignment with our philosophy of intentional living.</p>
          <p>From meditation cushions to aromatherapy diffusers, our collection is designed to create moments of presence and peace in your daily routine.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Meditation Essentials</h3>
            <p>Ergonomic cushions, benches, and mats that provide proper support for extended meditation sessions.</p>
          </div>
          <div className="feature-item">
            <h3>Sound Therapy</h3>
            <p>Singing bowls, tuning forks, and chimes calibrated to specific frequencies that promote relaxation and healing.</p>
          </div>
          <div className="feature-item">
            <h3>Aromatherapy Collection</h3>
            <p>Essential oil diffusers and carefully blended oils to create an atmosphere conducive to mindfulness.</p>
          </div>
          <div className="feature-item">
            <h3>Mindful Movement</h3>
            <p>Tools that support body awareness, proper alignment, and gentle stretching to complement your meditation practice.</p>
          </div>
        </div>

        <div className="featured-product">
          <div className="product-info">
            <h2>Featured: The RESZEN8 Meditation Set</h2>
            <p>Our signature meditation kit includes everything you need to establish a consistent practice: a premium buckwheat-filled cushion, a hand-crafted wooden timer, and our beginner's guide to meditation.</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WellnessTools;
