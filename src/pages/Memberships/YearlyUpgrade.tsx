import React from "react";
import MembershipCta from "./MembershipCta";
import { useAuth } from "../../contexts/AuthContext";
import Checkbox from "../../components/Checkbox/Checkbox";
import "./Memberships.scss";
const YearlyUpgrade = ({
  tier,
  onCheck,
  checked,
}: {
  tier: any;
  onCheck: (value: string) => void;
  checked: boolean;
}) => {
  // console.log(tier);
  const { currentUser } = useAuth();

  if (!tier.yearlyPriceDescription || currentUser?.subscription?.planName === `${tier.title} - ${tier.yearlyBilling}`)
    return null;

  const handleCheck = () => {
    if (checked === tier.id) return onCheck("");
    return onCheck(tier.id);
  };

  return (
    <div>
      <span className='membership__upgrade-info'>{tier.yearlyPriceDescription}</span>
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Checkbox size={40} checked={checked === tier.id} onChange={handleCheck} />
      </div>
    </div>
  );
};

export default YearlyUpgrade;
