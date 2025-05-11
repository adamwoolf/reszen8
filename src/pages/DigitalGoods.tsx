import React from 'react';
import './CategoryPage.css';

const DigitalGoods: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Digital Goods</h1>
        <p className="subtitle">Digital resources to enhance your daily practice</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>In our increasingly digital world, RESZEN8 brings mindfulness to your devices with thoughtfully designed digital resources. Our collection of apps, guides, and audio experiences helps you maintain your practice anywhere, anytime.</p>
          <p>Each digital product is created with the same attention to detail as our physical offerings, providing you with tools for mindfulness that integrate seamlessly into modern life.</p>
        </div>

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

        <div className="digital-subscription">
          <h2>RESZEN8 Digital Membership</h2>
          <p>Our all-access digital subscription gives you unlimited access to our complete library of digital resources, including exclusive content not available elsewhere. Members receive new content monthly and can join our online community of like-minded practitioners.</p>
          <div className="subscription-tiers">
            <div className="tier">
              <div className="tier-header">
                <h3>Monthly</h3>
                <p className="price">$14.99</p>
              </div>
              <button className="cta-button">Subscribe</button>
            </div>
            <div className="tier featured">
              <div className="tier-header">
                <h3>Annual</h3>
                <p className="price">$119.99</p>
              </div>
              <p className="saving">Save 33%</p>
              <button className="cta-button">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalGoods;
