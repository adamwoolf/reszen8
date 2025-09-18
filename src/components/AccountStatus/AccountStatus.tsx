import React, { useEffect, useState } from "react";
import "./AccountStatusStyles.scss";
import { User } from "../../models";

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
  console.log(user.subscription);
  if (!user?.subscription) return null;
  if (user?.subscription?.subscription === "free-trial")
    return (
      <>
        {hasTime && (
          <>
            <span className={`account-status-message`}>
              <span> Free trial: </span>
              <span className='time'>
                {" "}
                {days}d {hours}h {minutes}m, {seconds}s
              </span>
            </span>
            <span>
              bespoke credits: <span style={{ color: "orange" }}> {user.subscription.meditationCredits}</span>
            </span>
          </>
        )}
      </>
    );

  return (
    <>
      <span className={`account-status-message`}>Active {user.subscription.planSize}</span>
      <span>
        bespoke credits: <span style={{ color: "orange" }}> {user.subscription.meditationCredits}</span>
      </span>
    </>
  );
};

export default AccountStatus;
