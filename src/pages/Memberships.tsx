import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasketStore } from '../store/basketStore';
import './Memberships.css';

type MembershipTier = {
  id: string;
  name: string;
  type: 'digital' | 'premium';
  price: number;
  billing: 'monthly' | 'annual' | 'enquire';
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
        'Streamable resources',
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
      description: 'Unlimited access to all digital resources + Membership & Coaching Savings',
      features: [
        'Full digital library access',
        'New content monthly',
        'Streamable resources',
        'Member community access',
        'Exclusive member discounts',
        'Save 15% v monthly',
        'Discounted 1:1 coaching sessions'
      ]
    },
    {
      id: 'bespoke-journey',
      name: 'Bespoke RESZEN8 Journey',
      type: 'premium',
      price: 0,
      billing: 'enquire',
      description: 'Tailored wellness journey with all Digital Hub benefits + personalized coaching',
      features: [
        'Full digital library access',
        'New content monthly',
        'Streamable resources',
        'Member community access',
        'Exclusive member discounts',
        'Save 15% v monthly',
        'Discounted 1:1 coaching sessions',
        'Personalised coaching plan',
        'Customised wellness journey',
        'Priority support'
      ]
    }
  ];

  const handleSubscribe = (tier: MembershipTier) => {
    if (tier.id === 'bespoke-journey') {
      navigate('/contact');
      return;
    }
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
                {tier.price > 0 ? `£${tier.price.toFixed(2)}` : 'Enquire for pricing'}
                {tier.billing !== 'enquire' && <span className="billing">/ {tier.billing}</span>}
              </div>
              <p className="description">
                {tier.description}
                {tier.id === 'bespoke-journey' && (
                  <span className="coming-soon-tag">Coming Soon</span>
                )}
              </p>
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
              {tier.id === 'bespoke-journey' ? 'Make Enquiry' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      <div className="membership-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change my plan later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>Yes, we offer a 7-day free trial for new members. You can explore all features during this period with no obligation to continue.</p>
          </div>
          <div className="faq-item">
            <h3>How do I cancel my subscription?</h3>
            <p>You can cancel your subscription anytime from your account settings. Your membership will remain active until the end of your current billing period.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit/debit cards, PayPal, and Apple Pay. All payments are processed securely through our payment partners.</p>
          </div>
          <div className="faq-item">
            <h3>How do I access the member content?</h3>
            <p>Once you sign up and buy a membership, you'll get instant access to all member content through our website using your login credentials.</p>
          </div>
          <div className="faq-item">
            <h3>Can I share my membership with others?</h3>
            <p>Memberships are for individual use only. However, we offer family and team plans if you're interested in multiple accounts.</p>
          </div>
          <div className="faq-item">
            <h3>What's included in the Digital Hub membership?</h3>
            <p>The Digital Hub gives you access to our full library of resources, including guided meditations, courses, and exclusive member content.</p>
          </div>
          <div className="faq-item">
            <h3>How often is new content added?</h3>
            <p>We add new content regularly, including guided sessions, articles, and resources to support your wellness journey.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer discounts for annual plans?</h3>
            <p>Yes, our annual plans come with a 15% discount compared to our monthly plans, plus additional member benefits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memberships;
