import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLandingPageActive } from "../store/contentSlice";
import "./LandingPage.scss";

const LandingPage: React.FC = () => {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dispatch = useDispatch();

  const handleLogoClick = () => {
    sessionStorage.setItem("hideLandingpage", "true");
    setLeaving(true);
    dispatch(setLandingPageActive(false));
  };

  useEffect(() => {
    const shouldHide = !!sessionStorage.getItem("hideLandingpage");
    setShow(!shouldHide);
    dispatch(setLandingPageActive(!shouldHide));
  }, []);

  const handleAnimationEnd = () => {
    if (leaving) setShow(false);
  };

  useEffect(() => {
    if (show) {
      document.body.classList.add("lock-scroll");
    } else {
      document.body.classList.remove("lock-scroll");
    }

    return () => {
      // document.documentElement.style.overflow = "auto";
      // document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={!leaving ? "landing-page" : "landing-page landing-page--leaving"}
    >
      <button className='logo-container' onClick={handleLogoClick}>
        <h1 className='logo'>RESZEN8</h1>
        <p className='click-prompt'>Click to enter</p>
      </button>
    </div>
  );
};

export default LandingPage;
