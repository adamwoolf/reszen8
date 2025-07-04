import React, { useState } from "react";
import { generateScript } from "../services/aiMeditationService";

const ScriptLab = ({
  meditationType,
  duration,
  selectedLanguage,
  practiceType,
}: {
  meditationType: string;
  duration: string;
  selectedLanguage: string;
  practiceType: string;
}) => {
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);

  const getScript = async () => {
    setScript("");
    setGenerating(true);
    const res = await generateScript(meditationType, duration, selectedLanguage, practiceType);
    setScript(res);
    setGenerating(false);
  };

  const formattedScript = () => {
    return script.split("/>");
  };
  console.log(formattedScript());
  if (generating) return <div>Generating Script - please wait...</div>;
  return (
    <div>
      <button style={{ marginBottom: 40 }} onClick={getScript}>
        Return Script (test btn)
      </button>
      {script && <h3>{meditationType}</h3>}
      {formattedScript().map((p, i) => (
        <p key={i}>{`${p}`}</p>
      ))}
    </div>
  );
};

export default ScriptLab;
