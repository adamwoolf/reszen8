import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CategoryPage.css';

export default function MembersArea() {
  const { currentUser, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // In a real app, you would check the user's subscription status from your backend
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const seconds = prev.seconds - 1;
        let minutes = prev.minutes;
        let hours = prev.hours;
        let days = prev.days;
        
        if (seconds < 0) {
          minutes -= 1;
          if (minutes < 0) {
            hours -= 1;
            minutes = 59;
            if (hours < 0) {
              days -= 1;
              hours = 23;
              if (days < 0) {
                clearInterval(timer);
                setIsTrialActive(false);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
            return { days, hours, minutes, seconds: 59 };
          }
          return { ...prev, minutes, seconds: 59 };
        }
        return { ...prev, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Welcome to Your Members Area</h1>
        <p className="subtitle">Exclusive content and benefits for our valued members</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Thank you for being a part of the RESZEN8 community. Here you'll find exclusive content, member benefits, and tools to enhance your mindfulness journey.</p>
        </div>

        {isTrialActive && (
          <div className="trial-banner">
            <h3>Your Free Trial</h3>
            <p>Your trial period ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</p>
            <div className="button-group">
              <Link to="/memberships" className="cta-button">
                Upgrade Now
              </Link>
              <Link to="/memberships" className="cta-button secondary">
                Manage Membership
              </Link>
              <Link to="/apparel" className="cta-button tertiary">
                Why not grab some RESZEN8 Merch!
              </Link>
            </div>
          </div>
        )}
        
        {!isTrialActive && (
          <div className="account-actions">
            <Link to="/memberships" className="cta-button">
              Manage Membership
            </Link>
            <Link to="/apparel" className="cta-button tertiary">
              Why not grab some RESZEN8 Merch!
            </Link>
          </div>
        )}

        <div className="feature-grid">
          <div className="feature-item">
            <h3>Your Membership</h3>
            <p>Manage your subscription, update payment details, and view your membership status all in one place.</p>
          </div>
          <div className="feature-item">
            <h3>Exclusive Content</h3>
            <p>Access members-only meditations, guides, and resources to deepen your practice.</p>
          </div>
          <div className="feature-item">
            <h3>Member Benefits</h3>
            <p>Enjoy special discounts, early access to new features, and priority customer support.</p>
          </div>
          <div className="feature-item">
            <h3>Your Activity</h3>
            <p>Track your progress, save your favorite sessions, and set personal mindfulness goals.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
