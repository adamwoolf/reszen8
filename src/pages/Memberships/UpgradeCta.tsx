import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getPlanById } from "../../store/contentSelectors";
import { switchSubscription } from "../../store/apiUtils";
import { useAuth } from "../../contexts/AuthContext";
import Popup from "../../components/Popup/Popup";
import "./UpgradeCtaStyles.scss";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";

const UpgradeCta = ({ tier, yearlySelected }: { yearlySelected: string; tier: any }) => {
  const [showPopup, setShowPopup] = useState(false);
  const id = yearlySelected === tier.id ? tier.yearlyId : tier.id;
  const { currentUser, setCurrentUser } = useAuth();
  const [waiting, setWaiting] = useState(false);
  const plan = useSelector((state) => getPlanById(state, id));
  console.log(plan);
  const handleClick = async () => {
    setWaiting(true);
    await switchSubscription(currentUser?.uid, plan.priceId, plan);
    setCurrentUser({ ...currentUser, subscription: { ...currentUser?.subscription, ...plan } });

    setShowPopup(false);
    setWaiting(false);
  };
  if (!currentUser || tier.id === "free-trial" || currentUser.subscription.planName === tier.title) return null;
  return (
    <>
      <button type='button' onClick={() => setShowPopup(true)} className='subscribe-button'>
        Change Plan
      </button>
      <Popup fitContent show={showPopup} showClose={false}>
        <div className='overview'>
          <h3>Plan Overview:</h3>
          <p>
            <span>Title: </span>
            {plan.planName}
          </p>
          <p>{plan.description}</p>
          <p>
            <span>Billing: </span>
            {plan.billing}
          </p>
          <p>
            <span>Price: </span>£{plan.price}
          </p>
          <p>
            <span>Meditation Credits included per payment term: </span>
            {plan.meditationCredits}
          </p>
          <div style={{ display: "flex", background: "transparent" }}>
            <button style={{ marginRight: 8 }} onClick={() => setShowPopup(false)}>
              Cancel
            </button>
            <button type='button' onClick={handleClick}>
              Change Plan Now {waiting && <ThreeDotsLoader />}
            </button>
          </div>
          <small className='overview__disclaimer'>
            By clicking Change Plan, you will immediately be moved to your new plan and will be charged or credited for
            outstanding time or credit accordingly.{" "}
          </small>
        </div>
      </Popup>
    </>
  );
};

export default UpgradeCta;
