import React from 'react';
import './CategoryPage.css';

const Accessories: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Accessories</h1>
        <p className="subtitle">Complementary items to complete your wellness toolkit</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Our accessories collection features thoughtfully designed items that enhance your wellness practice and bring mindfulness into everyday moments. Each piece combines aesthetic appeal with practical function, creating objects that are as beautiful as they are useful.</p>
          <p>From journals to jewelry, our accessories serve as reminders of your commitment to presence and intention throughout your day.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Mindfulness Jewelry</h3>
            <p>Wearable reminders crafted from sustainable materials to bring awareness to your daily activities.</p>
          </div>
          <div className="feature-item">
            <h3>Journals & Stationery</h3>
            <p>Beautifully bound notebooks and writing tools to document your journey and reflections.</p>
          </div>
          <div className="feature-item">
            <h3>Home Accents</h3>
            <p>Carefully selected items that transform your living space into a sanctuary for practice.</p>
          </div>
          <div className="feature-item">
            <h3>Travel Essentials</h3>
            <p>Compact, versatile accessories designed to maintain your practice while on the move.</p>
          </div>
        </div>

        <div className="product-showcase">
          <h2>Featured Collection</h2>
          <div className="product-grid">
            <div className="product-card">
              <div className="product-image"></div>
              <h3>Intention Bracelet</h3>
              <p>Handcrafted from sustainable materials with an adjustable design</p>
              <p className="price">$28.00</p>
              <button className="cta-button">Coming Soon</button>
            </div>
            <div className="product-card">
              <div className="product-image"></div>
              <h3>Reflection Journal</h3>
              <p>100% recycled paper with prompts for daily mindfulness practice</p>
              <p className="price">$24.00</p>
              <button className="cta-button">Coming Soon</button>
            </div>
            <div className="product-card">
              <div className="product-image"></div>
              <h3>Meditation Timer</h3>
              <p>Minimalist design with gentle sound options for practice transitions</p>
              <p className="price">$36.00</p>
              <button className="cta-button">Coming Soon</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accessories;
