import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryPage.css';

const Meditations: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>RESZEN8 Meditation Hub</h1>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Our guided meditations are thoughtfully created by experienced practitioners to help you establish or deepen your mindfulness practice. Whether you're a beginner looking for an introduction to meditation or an experienced meditator seeking new perspectives, our library offers sessions tailored to your needs.</p>
          <p>In our increasingly digital world, RESZEN8 brings mindfulness to your devices with thoughtfully designed digital resources. Our collection of guides and audio experiences helps you maintain your practice anywhere, anytime.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Beginner Practice</h3>
            <p>Approachable sessions that introduce fundamental techniques and concepts for those new to meditation.</p>
          </div>
          <div className="feature-item">
            <h3>Specialised Practice</h3>
            <p>Targeted meditations for specific needs such as sleep, anxiety reduction, focus, and emotional resilience.</p>
          </div>
          <div className="feature-item">
            <h3>Advanced Practice</h3>
            <p>Deeper explorations for experienced practitioners, including non-dual awareness, vipassana, and mindful inquiry.</p>
          </div>
          <div className="feature-item">
            <h3>Special Meditation Events</h3>
            <p>Special meditation events designed to deepen your practice and connect you with a mindful community.
            Live sessions, workshops, and seasonal in person gatherings to support your inner journey.</p>
          </div>
        </div>

        <div className="digital-features">
          <h2>Digital Resources</h2>
          <p>Enhance your meditation practice with our carefully selected digital tools and resources.</p>
          
          <div className="feature-grid">
            <div className="feature-item">
              <h3>Meditation Apps</h3>
              <p>Simple, intuitive applications designed to guide your practice without distraction or unnecessary complexity.</p>
            </div>
            <div className="feature-item">
              <h3>E-Books & Guides</h3>
              <p>Comprehensive resources on mindfulness, breathwork, and meditation techniques written by experienced practitioners.</p>
            </div>
            <div className="feature-item">
              <h3>Audio Libraries</h3>
              <p>Curated collections of nature sounds, ambient music, and guided sessions to create the perfect atmosphere.</p>
            </div>
            <div className="feature-item">
              <h3>Practice Journals</h3>
              <p>Digital journals with prompts and tracking features to help you maintain consistency and reflect on your progress.</p>
            </div>
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
            <p>Access our complete library of guided meditations with a RESZEN8 Digital Membership</p>
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
