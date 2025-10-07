import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./CollectionsStyles.scss";
import MeditationCard from "../MeditationCard/MeditationCard";
const Collections = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);

  console.log(collections);

  const clickHandler = (collection: string) => {
    setDisplayCol(collections.filter((med) => med.collection === collection));
    handleClick?.(collection);
  };
  return (
    <div className='collections'>
      <h2>RESZEN8 Collections</h2>
      <div className='collections__cards'>
        {collections.map((col) => (
          <button onClick={() => clickHandler(col.collection)} className='collections__card'>
            <h3>{col.collection}</h3>

            {/* <p>{`${col.collection} - Meditation ${col.episode}: ${col.title}`} </p> */}
          </button>
        ))}
      </div>
      {displayCol.length > 0 && (
        <div className='collections__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {displayCol.map((med) => (
            <MeditationCard
              customTitle={`${med.collection} - Meditation ${med.episode}: ${med.title}`}
              item={med}
              showLike={false}
            />
          ))}
        </div>
      )}
      {displayCol.length > 0 && <button onClick={() => clickHandler("")}>back to library</button>}
    </div>
  );
};

export default Collections;
