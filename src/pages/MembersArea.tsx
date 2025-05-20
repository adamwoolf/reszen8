import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './MembersArea.css';

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
      // This is a simple countdown for demo purposes
      // In a real app, you would calculate this based on the user's signup date
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

  const handleSubscribe = () => {
    // In a real app, this would integrate with a payment processor
    setIsSubscribed(true);
    setIsTrialActive(false);
    // Add your subscription logic here
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="members-area">
      <h1>Welcome to RESZEN8 Premium</h1>
      <p className="user-email">Signed in as: {currentUser.email}</p>
      
      {isTrialActive && (
        <div className="trial-banner">
          <h2>Your 7-Day Free Trial</h2>
          <div className="countdown-timer">
            <div className="time-block">
              <span className="time-value">{timeLeft.days}</span>
              <span className="time-label">Days</span>
            </div>
            <div className="time-block">
              <span className="time-value">{timeLeft.hours}</span>
              <span className="time-label">Hours</span>
            </div>
            <div className="time-block">
              <span className="time-value">{timeLeft.minutes}</span>
              <span className="time-label">Minutes</span>
            </div>
            <div className="time-block">
              <span className="time-value">{timeLeft.seconds}</span>
              <span className="time-label">Seconds</span>
            </div>
          </div>
          <p className="trial-message">
            Your free trial ends soon! Upgrade now to continue enjoying premium features.
          </p>
          <button className="upgrade-button" onClick={handleSubscribe}>
            Upgrade to Premium
          </button>
        </div>
      )}

      {isSubscribed && (
        <div className="premium-banner">
          <h2>🎉 Thank You for Subscribing!</h2>
          <p>Your premium membership is now active. Enjoy all the benefits!</p>
        </div>
      )}

      <div className="membership-features">
        <h2>Your Membership Includes:</h2>
        <ul>
          <li>✓ Unlimited access to guided meditations</li>
          <li>✓ Exclusive wellness content</li>
          <li>✓ Member-only discounts</li>
          <li>✓ Early access to new features</li>
          <li>✓ Priority customer support</li>
        </ul>
      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
