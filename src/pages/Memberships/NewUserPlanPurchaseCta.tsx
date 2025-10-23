import React, { useState } from "react";
import Popup from "../../components/Popup/Popup";
import SignUp from "../Signup/Signup";
import { trackCTA } from "../../utils/analytics";

const NewUserPlanPurchaseCta = ({
  homepage,
  yearlySelected,
  tier = { id: "free-trial" },
}: {
  homepage: boolean;
  yearlySelected: string;
  tier: any;
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const planId = yearlySelected === tier.id ? tier.yearlyId : tier.id;

  return (
    <>
      <button
        onClick={() => {
          setShowPopup(true);
          trackCTA("Open New User Signup Popup");
        }}
        className={!homepage ? "subscribe-button" : ""}
      >
        {tier.id === "free-trial" ? "Sign Up & Start Free Trial" : "Sign Up & Purchase"}
      </button>
      <Popup
        fitContent
        show={showPopup}
        onClose={() => {
          setShowPopup(false);
          sessionStorage.removeItem("pendingPlan");
        }}
      >
        <div className='subscribe-popup'>
          <h3>Thank you for joining RESZEN8</h3>
          <SignUp
            onSuccess={() => {
              setShowPopup(false);
            }}
            planId={planId}
            tier={tier}
          />
        </div>
      </Popup>
    </>
  );
};

export default NewUserPlanPurchaseCta;
