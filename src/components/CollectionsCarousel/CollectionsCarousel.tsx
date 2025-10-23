import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./styles.scss";
import { getCollectionImages } from "../../contentful";
import { trackCTA } from "../../utils/analytics";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { sortByEpisode } from "../../Util";
import AmbientEnv from "../AmbientEnv/AmbientEnv";
import { useAuth } from "../../contexts/AuthContext";

const CollectionsCarousel = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const { addItem } = useSavedItems();
  const { currentUser } = useAuth();

  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);
  // const [images, setImages] = useState([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  const [selected, setSelected] = useState<string>("");
  const isAdded = currentUser?.savedItems?.collections?.map((col) => col.title)?.includes(selected);
  const images = useSelector((state) => state.content.collectionImages);
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
      image: image?.image?.file?.url,
      contentType: "collection",
    };
    await addItem(collection);

    console.log("ADDED", collection);
  };

  return (
    <div className='c-carousel'>
      <h2>RESZEN8 Collections</h2>
      <div className='c-carousel__cards'>
        {collectionTiles.map((col) => {
          const imgSrc = images.find((im) => im.collectionName === col)?.image?.url;
          return (
            <div key={col} className='c-carousel__card'>
              <img
                alt={`collection-main-image--${col}`}
                className={"c-carousel__card-image c-carousel__card-image--active"}
                src={imgSrc}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionsCarousel;
