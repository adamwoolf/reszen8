import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./Memberships.scss";

const MembershipCta = ({ tier, isAdded, handleSubscribe }) => {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser?.subscription?.subscription === tier.id ||
      currentUser?.subscription?.subId === tier.id ||
      (currentUser?.subscription?.hasCompletedTrial && tier.id === "free-trial") ||
      isAdded ||
      tier.title.includes("Enterprise") ? (
        <></>
      ) : !currentUser && tier.id !== "free-trial" ? (
        <button className='subscribe-button' disabled>
          Upgrade from Free Trial
        </button>
      ) : (
        <button
          className={`subscribe-button ${tier.mostPopular ? "featured-button" : ""}`}
          onClick={() => handleSubscribe(tier)}
        >
          {tier.id === "bespoke-journey" ? "Make Enquiry" : tier.freeTrial ? "Start Free Trial" : "Buy"}
        </button>
      )}
      {isAdded && (
        <button disabled className='subscribe-button'>
          Added to Basket
        </button>
      )}
      {tier.title.includes("Enterprise") && (
        <Link style={{ textAlign: "center" }} className='subscribe-button' to='/contact'>
          Make an enquiry
        </Link>
      )}
    </>
  );
};

export default MembershipCta;
