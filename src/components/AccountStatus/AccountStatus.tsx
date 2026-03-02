import React, { useEffect, useState } from "react";
import "./AccountStatusStyles.scss";
import { User } from "../../models";
import CreditTopup from "../CreditTopup/CreditTopup";

const AccountStatus = ({ user }: { user: User }) => {
  const start = user?.subscription?.startDate || 0;
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (user.subscription?.subscription !== "free-trial") return;
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + user.subscription?.duration || 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // update every second

    return () => clearInterval(interval);
  }, [start, user]); // Changed dependency to `start` since it's the relevant prop

  const { days, hours, minutes, seconds } = remaining;
  const hasTime = days + hours + minutes + seconds;

  // if (!user?.subscription || user?.subscription?.status === "canceled") return null;
  if (user?.subscription?.subscription === "free-trial")
    return (
      <>
        {hasTime && (
          <div className='credit-info__text'>
            <span style={{ marginRight: 20 }} className={`account-status-message`}>
              <span> Free trial: </span>
              <span className='time'>
                {" "}
                {days}d {hours}h {minutes}m, {seconds}s
              </span>
            </span>
            <span>
              meditation tokens: <span style={{ color: "orange" }}> {user.subscription.meditationCredits}</span>
            </span>
            <CreditTopup />
          </div>
        )}
      </>
    );

  return (
    <>
      {/* <span className={`account-status-message`}>Active {user.subscription.planSize}</span> */}
      <div className=''>
        <div className='credit-info__text'>
          <div>
            <span style={{ color: "orange" }}>
              Included Meditations:
              <span style={{ color: "orange" }}> {user.subscription?.meditationCredits}</span>
              {user.subscription?.extraBespokeMeditationCredits > 0 && (
                <span style={{ color: "orange" }}> | Tokens: {user.subscription?.extraBespokeMeditationCredits}</span>
              )}
            </span>
          </div>
          <CreditTopup />
        </div>
      </div>
    </>
  );
};

export default AccountStatus;
