import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./CollectionsStyles.scss";
import MeditationCard from "../MeditationCard/MeditationCard";
import { getCollectionImages } from "../../contentful";
import { trackCTA } from "../../utils/analytics";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { sortByEpisode } from "../../Util";
import AmbientEnv from "../AmbientEnv/AmbientEnv";
import { useAuth } from "../../contexts/AuthContext";

const Collections = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const { addItem } = useSavedItems();
  const { currentUser } = useAuth();

  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);
  const [images, setImages] = useState([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  const [selected, setSelected] = useState<string>("");
  const isAdded = currentUser?.savedItems?.collections?.map((col) => col.title)?.includes(selected);

  useEffect(() => {
    getCollectionImages().then((data) => {
      setImages(data);
    });
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

  const handleAddToJourney = async () => {
    const meditations = collections
      .filter((med) => med.collection === selected)
      ?.sort((a, b) => (a.episode > b.episode ? 1 : -1));

    const image = images.find((image) => image.collectionName === selected);
    const collection = {
      title: selected,
      id: selected,
      episodes: sortByEpisode(meditations),
      image: image?.url,
      contentType: "collection",
    };
    await addItem(collection);
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
          const imgSrc = images.find((im) => im.collectionName === col)?.image?.url;
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
          <button
            disabled={isAdded}
            onClick={handleAddToJourney}
            className={!isAdded ? "collections__save-cta" : "collections__save-cta collections__save-cta--disabled"}
          >
            {isAdded ? "Added to My Journey" : "Add to My Journey"}
          </button>
          <button className='collections__close-cta' onClick={() => clickHandler("")}>
            close collection
          </button>
          <AmbientEnv />
        </div>
      )}
      {displayCol.length > 0 && (
        <div className='collections__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sortByEpisode(displayCol).map((med) => {
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
