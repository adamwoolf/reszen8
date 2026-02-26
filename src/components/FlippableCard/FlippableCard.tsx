import { useState, useEffect } from "react";
import "./FlippableCard.scss";

export default function FlippableCard({ front, back, width = 900, height = 620, className = "", flipped = false }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(flipped);
  }, [flipped]);

  return (
    <div
      className={`flippable-card ${className} ${isFlipped ? "flippable-card--flipped" : ""}`}
      // style={{ width, height }}
    >
      <div className='flippable-card__inner'>
        <div className='flippable-card__face flippable-card__face--front'>{front}</div>

        <div className='flippable-card__face flippable-card__face--back'>{back}</div>
      </div>
    </div>
  );
}
