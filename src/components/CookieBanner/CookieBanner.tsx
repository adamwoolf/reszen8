import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./CookieBannerStyles.scss";

const CookieBanner = () => {
  const [leaving, setLeaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);

  const handleAnimationEnd = () => {
    if (leaving) {
      setLeaving(false);
      setShow(false);
    }
  };
  const COOKIES_KEY = "cookies-accepted";

  useEffect(() => {
    const accepted = !!sessionStorage.getItem("cookies-accepted");
    setShow(!accepted);
  }, []);

  const acceptClick = () => {
    sessionStorage.setItem(COOKIES_KEY, "true");
    setLeaving(true);
  };

  const cancelClick = () => {
    setLeaving(true);
  };

  const rootElement = document.getElementById("cookie-banner-root");
  if (!rootElement || !show) return null;

  return ReactDOM.createPortal(
    <>
      <div
        onAnimationEnd={handleAnimationEnd}
        className={!leaving ? "cookie-banner" : "cookie-banner cookie-banner--leaving"}
        ref={modalRef}
      >
        <h3>Age Consent</h3>

        <p className='cookie-banner__text'>To continue using RESZEN8 you must be at least 16 years old.</p>
        {/* <LiquidWrapper> */}
        <button onClick={acceptClick}>Confirm</button>
        <button className='cookie-banner__dismiss' onClick={cancelClick}>
          Dismiss
        </button>
        {/* </LiquidWrapper> */}
      </div>
    </>,
    rootElement
  );
};

export default CookieBanner;
