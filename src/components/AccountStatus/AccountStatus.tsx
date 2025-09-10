import React, { useEffect, useState } from "react";
import "./AccountStatusStyles.scss";
import { User } from "../../models";

const AccountStatus = ({ user }: { user: User }) => {
  const start = user?.subscription?.startDate;
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + user.subscription?.duration);

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
  }, [start]); // Changed dependency to `start` since it's the relevant prop

  const { days, hours, minutes, seconds } = remaining;
  const hasTime = days + hours + minutes + seconds;

  if (user?.subscription?.subscription === "monthly") return <span>Active Monthly Subscription</span>;

  return user?.subscription?.subscription === "free-trial" ? (
    hasTime ? (
      <span className={`account-status-message`}>
        <span> Free trial remaining: </span>
        <span className='time'>
          {" "}
          {days}d {hours}h {minutes}m, {seconds}s
        </span>
      </span>
    ) : (
      <span>Your free trial has expired. Please update your subscription </span>
    )
  ) : null;
};

export default AccountStatus;
