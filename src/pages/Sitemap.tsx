import React from 'react';
import { Link } from 'react-router-dom';
import './Sitemap.css';

// Define the sitemap structure
const sitemapData = {
  'Main': [
    { path: '/', label: 'Homepage', priority: 1.0 },
    { path: '/home', label: 'Home', priority: 0.9 },
    { path: '/about', label: 'About', priority: 0.8 },
    { path: '/photos', label: 'Photos', priority: 0.7 },
    { path: '/contact', label: 'Contact', priority: 0.8 }
  ],
  'Shop & Services': [
    { path: '/apparel', label: 'Apparel', priority: 0.7 },
    { path: '/guided-meditations', label: 'Guided Meditations', priority: 0.7 },
    { path: '/memberships', label: 'Memberships', priority: 0.7 }
  ],
  'Account': [
    { path: '/login', label: 'Login', priority: 0.5 },
    { path: '/signup', label: 'Sign Up', priority: 0.5 }
  ],
  'Checkout Process': [
    { path: '/basket', label: 'Shopping Basket', priority: 0.6 },
    { path: '/checkout', label: 'Checkout', priority: 0.6 },
    { path: '/order-success', label: 'Order Confirmation', priority: 0.3 }
  ],
  'Member-Only Areas': [
    { path: '/members', label: 'Members Area', priority: 0.8, protected: true },
    { path: '/ai-chat', label: 'AI Chat', priority: 0.7, protected: true }
  ],
  'Legal': [
    { path: '/terms-and-conditions', label: 'Terms & Conditions', priority: 0.2 },
    { path: '/privacy-policy', label: 'Privacy Policy', priority: 0.2 }
  ],
  'Development': [
    { path: '/test-payment', label: 'Test Payment', priority: 0.1 }
  ]
};

const Sitemap: React.FC = () => {
  return (
    <div className="sitemap-container">
      <h1>Website Sitemap</h1>
      <div className="sitemap">
        {Object.entries(sitemapData).map(([section, links]) => (
          <div key={section} className="section">
            <h2>{section}</h2>
            <div className="section-links">
              {links.map(({ path, label, priority, protected: isProtected }) => (
                <div key={path} className="sitemap-link">
                  <Link to={path}>
                    {label}
                    {isProtected && <span className="protected-badge">Protected</span>}
                  </Link>
                  <span className="priority-badge">{priority.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="last-updated">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;