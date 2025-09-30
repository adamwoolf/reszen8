import React, { useState, useEffect, useRef } from "react";
import Popup from "../Popup/Popup";
import { useAuth } from "../../contexts/AuthContext";
import "./ConsentsPopupStyles.scss";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import { FaArrowCircleDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
const ConsentsPopup = () => {
  const [show, setShow] = useState(false);
  const { currentUser, loading, updateUser, setCurrentUser } = useAuth();
  const [consentData, setConsentData] = useState({
    essentials: false,
    analytics: false,
    marketing: false,
    termsAndConditions: false,
  });
  const [waiting, setWaiting] = useState(false);
  const termsAndConditionsRef = useRef<HTMLHeadingElement>(null);
  const planId = sessionStorage.getItem("pendingPlan");

  const handleUpdate = async () => {
    setWaiting(true);
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, consents: consentData });
    await updateUser(currentUser?.uid, { consents: consentData });
    setWaiting(false);
    setShow(false);
  };

  useEffect(() => {
    if (!currentUser || loading || planId) return;
    setShow(currentUser && (!currentUser?.consents?.termsAndConditions || !currentUser?.consents?.essentials));
  }, [currentUser, planId]);

  const consents = [
    {
      title: "Essentials Always Active (Required)",
      description: "Required for RESZEN8 to function propertly (eg site security, user settings,  and login.",
      dataLink: "essentials",
    },
    {
      title: "Analytics (Optional)",
      description: "Helps us understand how people use RESZEN8 so that we can improve your experience.",
      dataLink: "analytics",
    },
    {
      title: "Marketing (Optional)",
      description:
        "If you agree, we use cookies for targeted advertising and may send you updates or offers from RESZEN8.  You can opt out anytime.",
      dataLink: "marketing",
    },
  ];

  const isTandCVisible = useIntersectionObserver(termsAndConditionsRef);
  const scrollToTandC = () => {
    termsAndConditionsRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Popup showClose={false} fitContent show={show} onClose={() => setShow(false)}>
      <div className='consents'>
        {!isTandCVisible && (
          <button onClick={scrollToTandC} className='consents__scroller'>
            <FaArrowCircleDown size={24} color='orange' />
          </button>
        )}
        <h2>Manage Consent Preferences</h2>
        {consents.map((consent) => (
          <section key={consent.dataLink} className='consents__section'>
            <div className='consents__section-header'>
              <h3>{consent.title}</h3>
              <ToggleSwitch
                onChange={(e) => setConsentData({ ...consentData, [consent.dataLink]: e })}
                checked={consentData[consent.dataLink]}
                noLabel
                onOffState
              />
            </div>
            <p>{consent.description}</p>
          </section>
        ))}

        <h3 ref={termsAndConditionsRef}>Terms & Conditions (Required)</h3>
        <div className='consents__section-header consents__section-header--t-and-c'>
          <ToggleSwitch
            checked={consentData.termsAndConditions}
            onChange={(e) => setConsentData({ ...consentData, termsAndConditions: e })}
            noLabel
            onOffState
          />
          <p>
            I agree to the RESZEN8 <Link to='terms-and-conditions'>Terms & Conditions</Link>
          </p>
        </div>
        <p className='consents__privacy-link'> You must accept our Terms and Conditions in order to use RESZEN8.</p>
        <span className='consents__privacy-link'>
          See our <Link to='privacy-policy'>privacy policy</Link>
        </span>

        <div>
          {currentUser?.consents?.termsAndConditions && currentUser?.consents?.essentials && (
            <button className='consents__cancel'>Cancel</button>
          )}
          <button
            onClick={handleUpdate}
            disabled={!consentData.termsAndConditions || !consentData.essentials}
            className='consents__accept'
          >
            {!waiting ? "Update Consent and Preferences" : "Updating your preferences"}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default ConsentsPopup;
