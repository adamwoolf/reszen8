import React from "react";
import MembershipCta from "./MembershipCta";
import { useAuth } from "../../contexts/AuthContext";
import Checkbox from "../../components/Checkbox/Checkbox";
import "./Memberships.scss";
import ToggleContainer from "../MeditationLibrary/ToggleContainer";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
const YearlyUpgrade = ({
  tier,
  onCheck,
  checked,
}: {
  tier: any;
  onCheck: (value: string) => void;
  checked: boolean;
}) => {
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
      <div className='yearly__container'>
        <span className='yearly__label'>Monthly</span>
        <ToggleSwitch noLabel checked={checked === tier.id} onChange={handleCheck} />
        <span className='yearly__label'>Yearly</span>
      </div>
    </div>
  );
};

export default YearlyUpgrade;
