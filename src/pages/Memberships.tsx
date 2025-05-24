import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasketStore } from '../store/basketStore';
import './Memberships.css';

type MembershipTier = {
  id: string;
  name: string;
  type: 'digital' | 'premium';
  price: number;
  billing: 'monthly' | 'annual';
  description: string;
  features: string[];
  mostPopular?: boolean;
};

const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useBasketStore();

  const membershipTiers: MembershipTier[] = [
    {
      id: 'digital-monthly',
      name: 'Digital Hub - Monthly',
      type: 'digital',
      price: 24.99,
      billing: 'monthly',
      description: 'Unlimited access to all digital resources',
      features: [
        'Full digital library access',
        'New content monthly',
        'Downloadable resources',
        'Member community access',
        'Exclusive member discounts'
      ]
    },
    {
      id: 'premium-annual',
      name: 'Digital Hub - Yearly',
      type: 'premium',
      price: 255.00,
      billing: 'annual',
      description: 'Unlimited access to all digital resources & a 15% reduction on monthly membership',
      features: [
        'Everything in Digital & Guided',
        'Live Q&A sessions',
        'Personalized recommendations',
        '1:1 coaching session monthly',
        'Priority customer support',
        'Save 33% vs monthly'
      ]
    }
  ];

  const handleSubscribe = (tier: MembershipTier) => {
    addItem({
      id: tier.id,
      name: `${tier.name} (${tier.billing})`,
      price: tier.price,
      description: tier.description
    });
    navigate('/basket');
  };

  return (
    <div className="memberships-page">
      <header className="memberships-header">
        <h1>Choose Your Membership</h1>
        <p className="subtitle">Find the perfect plan for your wellness journey</p>
      </header>

      <div className="membership-grid">
        {membershipTiers.map((tier) => (
          <div key={tier.id} className={`membership-card ${tier.mostPopular ? 'featured' : ''}`}>
            {tier.mostPopular && <div className="popular-badge">Most Popular</div>}
            <div className="membership-header">
              <h3>{tier.name}</h3>
              <div className="price">
                £{tier.price.toFixed(2)}
                <span className="billing">/ {tier.billing}</span>
              </div>
              <p className="description">{tier.description}</p>
            </div>
            <ul className="features">
              {tier.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`subscribe-button ${tier.mostPopular ? 'featured-button' : ''}`}
              onClick={() => handleSubscribe(tier)}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>

      <div className="membership-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change my plan later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>We don't offer a free trial, but we have a 30-day money-back guarantee if you're not satisfied.</p>
          </div>
          <div className="faq-item">
            <h3>How do I cancel my subscription?</h3>
            <p>You can cancel your subscription anytime from your account settings. No questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memberships;
