import React from 'react';
import './CategoryPage.css';

const Apparel: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>RESZEN8 Apparel</h1>
        <p className="subtitle">Premium comfort wear designed for your wellness journey</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Our apparel collection is crafted with intention, using sustainable materials that respect both your body and the planet. Each piece is designed to accompany you through meditation, movement, and moments of mindfulness.</p>
          <p>We believe that what you wear influences how you feel. That's why our clothing combines ethical production with exceptional comfort, allowing you to focus on your practice without distraction.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Mindful Materials</h3>
            <p>Ethically sourced organic cotton, bamboo blends, and recycled fabrics that are gentle on sensitive skin.</p>
          </div>
          <div className="feature-item">
            <h3>Comfort-First Design</h3>
            <p>Relaxed fits and breathable fabrics to support movement and stillness in equal measure.</p>
          </div>
          <div className="feature-item">
            <h3>Sustainable Production</h3>
            <p>Low-impact dyes and water-conserving manufacturing processes that minimize environmental footprint.</p>
          </div>
          <div className="feature-item">
            <h3>Versatile Pieces</h3>
            <p>Transition seamlessly from yoga to daily life with pieces that adapt to your lifestyle.</p>
          </div>
        </div>

        <div className="coming-soon">
          <h2>Collection Coming Soon</h2>
          <p>Our first apparel collection is in production and will be available for purchase in Summer 2025. Join our mailing list to be the first to know when it launches.</p>
          <button className="cta-button">Sign Up for Updates</button>
        </div>
      </section>
    </div>
  );
};

export default Apparel;
