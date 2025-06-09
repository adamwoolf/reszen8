import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./CategoryPage.css";
import "./Home.css";

export default function MembersArea() {
  const { currentUser, logout } = useAuth();
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleResetPassword = () => {
    // Add password reset logic here
    alert('Password reset link will be sent to your email');
  };

  const handleCancelMembership = () => {
    // Add membership cancellation logic here
    if (window.confirm('Are you sure you want to cancel your membership?')) {
      alert('Your membership has been cancelled. We\'re sorry to see you go!');
      setIsSubscribed(false);
    }
  };

  if (!currentUser) {
    return <Navigate to='/login' />;
  }

  return (
    <div className='home-page'>
      <header className='mission-statement'>
        <div className='mission-content'>
          <h1>Welcome to Your Members Area</h1>
          <p className="mission-text">
            Thank you for being a part of the RESZEN8 community. You can manage your membership below.
          </p>
        </div>
      </header>

      <section className="features-section">
        <div className="features-container">
          {!isSubscribed && isTrialActive && (
            <div className="feature-card">
              <h3 className="feature-title">Free Trial</h3>
              <p className="feature-description">
                Enjoy full access to our premium features during your trial period.
                <br /><br />
                <strong>Included in your trial:</strong>
                <ul>
                  <li>Unlimited access to all meditations</li>
                  <li>Personalized recommendations</li>
                  <li>Downloadable meditation guides</li>
                  <li>Priority customer support</li>
                </ul>
              </p>
              <button className="membership-cta" style={{ marginTop: '1rem' }} onClick={() => setIsSubscribed(true)}>
                Upgrade Now
              </button>
            </div>
          )}

          {isSubscribed && (
            <div className="feature-card">
              <h3 className="feature-title">Your Membership</h3>
              <p className="feature-description">
                <strong>Premium Membership Benefits:</strong>
                <ul>
                  <li>Unlimited access to all meditations</li>
                  <li>Downloadable meditation guides</li>
                  <li>Personalized recommendations</li>
                  <li>Exclusive member content</li>
                  <li>Priority customer support</li>
                  <li>Offline listening</li>
                </ul>
                <br />
                <strong>Next Billing Date:</strong> June 30, 2025
              </p>
              <button className="membership-cta" style={{ marginTop: '1rem' }}>
                Manage Subscription
              </button>
            </div>
          )}

          <div className="feature-card">
            <h3 className="feature-title">Account Security</h3>
            <p className="feature-description">
              Keep your account secure by updating your password regularly.
              <br /><br />
              Reset your password to ensure your account remains protected.
            </p>
            <button 
              className="membership-cta" 
              style={{ 
                marginTop: '1rem',
                background: 'transparent',
                border: '2px solid #FFA500',
                color: '#FFA500'
              }}
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </div>

          <div className="feature-card">
            <h3 className="feature-title">Cancel Membership</h3>
            <p className="feature-description">
              We're sorry to see you go. If you cancel, you'll lose access to all premium features at the end of your billing period.
              <br /><br />
              <strong>Note:</strong> You can reactivate your membership at any time.
            </p>
            <button 
              className="membership-cta" 
              style={{ 
                marginTop: '1rem',
                background: 'transparent',
                border: '2px solid #ff4d4d',
                color: '#ff4d4d'
              }}
              onClick={handleCancelMembership}
            >
              Cancel Membership
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
