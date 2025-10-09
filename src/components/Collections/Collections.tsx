import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./CollectionsStyles.scss";
import MeditationCard from "../MeditationCard/MeditationCard";
import { getCollectionImages } from "../../contentful";
import { trackCTA } from "../../utils/analytics";

const Collections = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);
  const [images, setImages] = useState([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  const [selected, setSelected] = useState(collectionTiles[1]);

  useEffect(() => {
    getCollectionImages().then((data) => setImages(data.items.map((item) => ({ ...item.fields }))));
  }, []);

  const clickHandler = (collection: string) => {
    trackCTA(`Collection select-tile-${collection}`);
    setDisplayCol(collections.filter((med) => med.collection === collection));
    handleClick?.(collection);
    setSelected(collection);
    if (collection) {
      headerRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0 });
    }
  };
  return (
    <div className='collections'>
      <h2>RESZEN8 Collections</h2>
      <div className='collections__cards'>
        {/* {images.map((image) => (
          <img
            className={
              selected === image.collectionName
                ? "collections__background collections__background--active"
                : "collections__background"
            }
            src={image.background?.fields?.file?.url}
          />
        ))} */}

        {collectionTiles.map((col) => {
          const imgSrc = images.find((im) => im.collectionName === col)?.image?.fields?.file?.url;
          console.log(col);
          console.log(selected);
          return (
            <button onClick={() => clickHandler(col)} className='collections__card'>
              <h3>{col}</h3>
              <img
                className={
                  selected === col
                    ? "collections__card-image collections__card-image--active"
                    : "collections__card-image"
                }
                src={imgSrc}
              />
            </button>
          );
        })}
      </div>
      <div className='collections__selected-anchor' ref={headerRef} />
      {displayCol.length > 0 && (
        <div className='collections__selected'>
          <h3 className='collections__selected-heading'>{selected}</h3>
          <button className='collections__save-cta'>Add to My Journey</button>
          <button className='collections__close-cta' onClick={() => clickHandler("")}>
            close collection
          </button>
        </div>
      )}
      {displayCol.length > 0 && (
        <div className='collections__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {displayCol
            .sort((a, b) => (a.episode > b.episode ? 1 : -1))
            .map((med) => {
              const imgSrc = images.find((im) => im.collectionName === med.collection)?.image?.fields?.file?.url;

              return (
                <MeditationCard
                  customTitle={
                    med.episode !== "0"
                      ? `${med.collection} - Meditation ${med.episode}: ${med.title}`
                      : `${med.collection}: ${med.title}`
                  }
                  item={med}
                  showLike={false}
                  customImage={imgSrc}
                  isCollection
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Collections;
