import React, { useState, useEffect, useRef } from "react";
import Popup from "../Popup/Popup";
import { useAuth } from "../../contexts/AuthContext";
// import "./ConsentsPopupStyles.scss";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import { FaArrowCircleDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { trackCTA } from "../../utils/analytics";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";

const ConsentsConsole = ({ compact }: { compact?: boolean }) => {
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
    trackCTA("Update Consents");
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
    setConsentData(currentUser.consents);
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
    <div className='consents consents--compact'>
      <h2>Manage Consent Preferences</h2>
      {consents.map((consent) => {
        return (
          <section
            key={consent.dataLink}
            className={!compact ? "consents__section" : "consents__section consents__section--compact"}
          >
            <div className='consents__section-header'>
              <h3 className={compact ? "consents__small-header" : ""}>{consent.title}</h3>
              <ToggleSwitch
                onChange={(e) => setConsentData({ ...consentData, [consent.dataLink]: e })}
                checked={consentData[consent.dataLink]}
                noLabel
                onOffState
                className={consent.dataLink === "essentials" ? "consents--disabled" : ""}
              />
            </div>
            <p className={compact ? "consents__small-description" : ""}>{consent.description}</p>
          </section>
        );
      })}
      <button style={{ display: "flex" }} onClick={handleUpdate}>
        Update {waiting && <ThreeDotsLoader />}
      </button>
    </div>
  );
};

export default ConsentsConsole;
