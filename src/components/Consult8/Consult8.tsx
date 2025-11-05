import React, { useEffect, useState } from "react";
import "./ConsultStyles.scss";
import { MedTypesAndAffirmations } from "../../services/helpers";
import { trackCTA } from "../../utils/analytics";

const feelings = [
  "Calm",
  "Anxious",
  "Relaxed",
  "Tired",
  "Angry",
  "Grateful",
  "Focused",
  "Lonely",
  "Hopeful",
  "Restless",
  "Sad",
  "Distracted",
];

const feelingToMeditations = {
  Calm: { Mindfulness: 3, Gratitude: 2 },
  Relaxed: { Mindfulness: 2, "Better Sleep": 3 },
  Tired: { "Better Sleep": 3, Mindfulness: 1 },
  Anxious: { "Anxiety Relief": 3, "Stress Relief": 2, Mindfulness: 1 },
  Angry: { Anger: 3, Compassion: 2, "Stress Relief": 1 },
  Grateful: { Gratitude: 3, "Loving & Kindness": 2 },
  Focused: { "Focus & Concentration": 3, Mindfulness: 2 },
  Lonely: { Relationships: 3, Compassion: 2, "Loving & Kindness": 2 },
  Hopeful: { Resilience: 3, Gratitude: 2 },
  Restless: { Mindfulness: 2, "Better Sleep": 2, "Anxiety Relief": 3 },
  Sad: { Compassion: 3, "Loving & Kindness": 2, Resilience: 2 },
  Distracted: { "Focus & Concentration": 3, Mindfulness: 2 },
};

function getRecommendedMeditation(selectedFeelings) {
  const scores = {};

  [selectedFeelings].forEach((feeling) => {
    const mapping = feelingToMeditations[feeling];
    if (!mapping) return;

    for (const [meditation, weight] of Object.entries(mapping)) {
      scores[meditation] = (scores[meditation] || 0) + weight;
    }
  });

  if (Object.keys(scores).length === 0) return "Mindfulness";

  const maxScore = Math.max(...Object.values(scores));
  const bestMatches = Object.keys(scores).filter((meditation) => scores[meditation] === maxScore);

  return bestMatches[0];
}

const Consult8 = ({ setMeditationType }: { setMeditationType: (value: string) => void }) => {
  const [choices, setChoices] = useState<string[]>([]);

  const handleClick = (option: string) => {
    trackCTA("Consult8 Mood CTA", option);
    if (choices.includes(option)) {
      setChoices([...choices].filter((c) => c !== option));
    } else {
      if (choices.length < 3) setChoices([...choices, option]);
    }
  };

  useEffect(() => {
    setMeditationType(getRecommendedMeditation(choices));
  }, [choices]);

  return (
    <div className='feelings__container'>
      <h3>How are you feeling?</h3>
      <p>select up to 3 choices</p>
      <div className='feelings'>
        {feelings.map((f) => (
          <button
            className={choices.includes(f) ? "feelings__button feelings__button--selected" : "feelings__button"}
            type='button'
            onClick={() => handleClick(f)}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Consult8;
