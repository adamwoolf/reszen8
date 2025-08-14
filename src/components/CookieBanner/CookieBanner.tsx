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
    const accepted = !!localStorage.getItem("cookies-accepted");
    setShow(!accepted);
  }, []);

  const acceptClick = () => {
    localStorage.setItem(COOKIES_KEY, "true");
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
        <h3>Cookie Policy</h3>

        <p className='cookie-banner__text'>
          We use cookies and similar technologies to make Reszen8 work, improve your experience, and analyze how our
          site is used. We may also use any information you provide to contact you with updates and information related
          to Reszen8. By clicking “Accept all,” you agree to our use of cookies as described in our Privacy Policy. You
          can manage your preferences at any time.
        </p>
        {/* <LiquidWrapper> */}
        <button onClick={acceptClick}>Accept all</button>
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
