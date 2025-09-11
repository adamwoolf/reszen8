import React from "react";
import Anger from "../../assets/icons/Anger.png";
import AnxietyRelief from "../../assets/icons/Anxiety_Relief.png";
import BetterSleep from "../../assets/icons/Better_Sleep.png";
import Compassion from "../../assets/icons/Compassion.png";
import FocusandConcentration from "../../assets/icons/Focus_And_Concentration.png";
import Gratitude from "../../assets/icons/Gratitude.png";
import LovingKindness from "../../assets/icons/Loving_Kindness.png";
import Mindfulness from "../../assets/icons/Mindfulness.png";
import Relationships from "../../assets/icons/Relationships.png";
import Resilience from "../../assets/icons/Resilience.png";
import StressRelief from "../../assets/icons/Stress_Relief.png";
import Trauma from "../../assets/icons/Trauma.png";
import "./IconStyles.scss";

export const getIcon = {
  Mindfulness,
  Gratitude,
  BetterSleep,
  FocusandConcentration,
  Compassion,
  LovingKindness,
  Relationships,
  Resilience,
  StressRelief,
  Anger,
  AnxietyRelief,
  Trauma,
  Uncategorized: Mindfulness,
};

const Icon = ({ type, large, gridItem }: { type: string; large?: boolean; gridItem?: boolean }) => {
  return (
    <div className='icon__container'>
      <img className={!large ? "icon" : "icon icon--large"} src={getIcon[type?.replace(/\s+/g, "")]} />
    </div>
  );
};

export default Icon;
