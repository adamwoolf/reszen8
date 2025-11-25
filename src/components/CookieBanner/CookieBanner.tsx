import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./CookieBannerStyles.scss";

const CookieBanner = () => {
  const { currentUser } = useAuth();
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
    // Don't show banner if user is logged in
    if (currentUser) {
      setShow(false);
      return;
    }

    const accepted = !!sessionStorage.getItem("cookies-accepted");
    setShow(!accepted);
  }, [currentUser]);

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

        <p className='cookie-banner__text'>
          RESZEN8 is for ages 16 and up. By clicking Confirm, you confirm you meet this requirement. Please refer to our{" "}
          <a href='https://reszen8.com/terms-and-conditions' target='_blank'>
            Terms and Conditions
          </a>
        </p>
        <button className='cookie-banner__dismiss' onClick={cancelClick}>
          Dismiss
        </button>
        <button onClick={acceptClick}>Confirm</button>
      </div>
    </>,
    rootElement
  );
};

export default CookieBanner;
