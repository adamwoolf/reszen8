import React, { useState } from "react";
import Popup from "../../components/Popup/Popup";
import SignUp from "../Signup/Signup";
const NewUserPlanPurchaseCta = ({ yearlySelected, tier }: { yearlySelected: string; tier: any }) => {
  const [showPopup, setShowPopup] = useState(false);

  const planId = yearlySelected === tier.id ? tier.yearlyId : tier.id;

  return (
    <>
      <button onClick={() => setShowPopup(true)} className='subscribe-button'>
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
              // sessionStorage.setItem("pendingPlan", planId);
            }}
            planId={planId}
            tier={tier}
          />
          {/* <p>On filling in this form and clicking Continue, you will:</p>

          <p>
            {" "}
            <span className='subscribe-popup__number'>1. </span> Visit our secure payment area to pay for your plan.{" "}
          </p>
          <p>
            {" "}
            <span className='subscribe-popup__number'>2. </span>Return to our website so you can start enjoying your
            RESZEN8 subscription.{" "}
          </p> */}
        </div>
      </Popup>
    </>
  );
};

export default NewUserPlanPurchaseCta;
