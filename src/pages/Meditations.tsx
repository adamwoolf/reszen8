import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryPage.css';

const Meditations: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Guided Meditations</h1>
        <p className="subtitle">Expert-led sessions for all experience levels</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Our guided meditations are thoughtfully created by experienced practitioners to help you establish or deepen your mindfulness practice. Whether you're a beginner looking for an introduction to meditation or an experienced meditator seeking new perspectives, our library offers sessions tailored to your needs.</p>
          <p>Each meditation is crafted with careful attention to pacing, language, and ambient sound to create an immersive experience that supports your wellness journey.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Beginner Series</h3>
            <p>Approachable sessions that introduce fundamental techniques and concepts for those new to meditation.</p>
          </div>
          <div className="feature-item">
            <h3>Specialized Practice</h3>
            <p>Targeted meditations for specific needs such as sleep, anxiety reduction, focus, and emotional resilience.</p>
          </div>
          <div className="feature-item">
            <h3>Advanced Techniques</h3>
            <p>Deeper explorations for experienced practitioners, including non-dual awareness, vipassana, and mindful inquiry.</p>
          </div>
          <div className="feature-item">
            <h3>Themed Collections</h3>
            <p>Curated series that explore specific themes or traditions over multiple sessions for comprehensive understanding.</p>
          </div>
        </div>

        <div className="meditation-samples">
          <h2>Sample Our Guided Meditations</h2>
          <div className="sample-list">
            <div className="sample-item">
              <h3>Morning Clarity</h3>
              <p>A 10-minute practice to start your day with intention and awareness</p>
              <button className="play-button">▶ Listen</button>
            </div>
            <div className="sample-item">
              <h3>Body Scan Relaxation</h3>
              <p>A 15-minute systematic relaxation to release tension and connect with your body</p>
              <button className="play-button">▶ Listen</button>
            </div>
            <div className="sample-item">
              <h3>Compassion Practice</h3>
              <p>A 12-minute heart-centered meditation to cultivate kindness toward yourself and others</p>
              <button className="play-button">▶ Listen</button>
            </div>
          </div>
          <div className="access-all">
            <p>Access our complete library of over 200 guided meditations with a RESZEN8 Digital Membership</p>
            <Link to="/memberships" className="cta-button">
              Explore Membership Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Meditations;
