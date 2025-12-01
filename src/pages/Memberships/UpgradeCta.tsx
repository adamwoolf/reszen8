import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getPlanById } from "../../store/contentSelectors";
import { switchSubscription } from "../../store/apiUtils";
import { useAuth } from "../../contexts/AuthContext";
import Popup from "../../components/Popup/Popup";
import "./UpgradeCtaStyles.scss";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";
import { AWS_DB_ENDPOINT } from "../../constants";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const UpgradeCta = ({ tier, yearlySelected }: { yearlySelected: string; tier: any }) => {
  const [showPopup, setShowPopup] = useState(false);
  const id = yearlySelected === tier.id ? tier.yearlyId : tier.id;
  const { currentUser, setCurrentUser } = useAuth();
  const [waiting, setWaiting] = useState(false);
  const plan = useSelector((state) => getPlanById(state, id));
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

  const upgradeFromTrial = async (user: any, selectedPlan: any, selectedSubData: any) => {
    const res = await fetch(`${AWS_DB_ENDPOINT}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "subscription",
        email: user.email,
        firstName: currentUser?.firstName,
        lastName: currentUser?.surName,
        uid: user.uid,
        planId: selectedPlan.priceId,
        metadata: { uid: user?.uid },
        lineItems: [{ price: selectedPlan.priceId, quantity: 1 }], // 👈 send array of line items
        subscription: selectedSubData,
      }),
    });
    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  };

  const handleClick = async () => {
    setWaiting(true);
    const selectedSubData = {
      hasCompletedTrial: true,
      meditationCredits: plan?.medCredits,
      size: plan?.billing,
      subId: plan?.id,
      planName: plan?.title,
      subscription: plan.id,
      active: true,
      status: "active",
      planCredits: plan?.medCredits,
    };
    if (currentUser?.subscription?.subscription === "free-trial" || currentUser?.subscription?.status === "canceled") {
      await upgradeFromTrial(currentUser, plan, selectedSubData);
    } else {
      await switchSubscription(
        currentUser?.uid,
        plan.priceId,
        selectedSubData,
        currentUser?.email,
        currentUser.firstName
      );
    }
    setCurrentUser({ ...currentUser, subscription: { ...plan, ...selectedSubData } });

    setShowPopup(false);
    setWaiting(false);
  };

  if (!currentUser || tier.id === "free-trial") return null;
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
            <span>Meditation Tokens included per payment term: </span>
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
            When you click Change Plan Now, if you are upgrading from the free trial or rejoining from an expired plan,
            you will be taken to our Stripe checkout to enter your card details and start your plan. Otherwise, you will
            immediately be moved to your new plan, without leaving our site, and will be charged or credited for
            outstanding time or credit accordingly.
          </small>
        </div>
      </Popup>
    </>
  );
};

export default UpgradeCta;
