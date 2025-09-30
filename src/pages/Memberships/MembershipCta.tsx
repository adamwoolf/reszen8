import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./Memberships.scss";
import NewUserPlanPurchaseCta from "./NewUserPlanPurchaseCta";

const MembershipCta = ({
  tier,
  isAdded,
  handleSubscribe,
  yearlySelected,
}: {
  yearlySelected: string;
  handleSubscribe: () => void;
  isAdded: boolean;
  tier: any;
}) => {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser?.subscription?.subscription === tier.id ||
      currentUser?.subscription?.subId === tier.id ||
      (currentUser?.subscription?.hasCompletedTrial && tier.id === "free-trial") ||
      isAdded ||
      tier.title.includes("Enterprise") ? (
        <></>
      ) : !currentUser ? (
        <NewUserPlanPurchaseCta tier={tier} yearlySelected={yearlySelected} />
      ) : (
        <button
          className={`subscribe-button ${tier.mostPopular ? "featured-button" : ""}`}
          onClick={() => handleSubscribe(tier)}
        >
          {tier.id === "bespoke-journey" ? "Make Enquiry" : "Buy"}
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
