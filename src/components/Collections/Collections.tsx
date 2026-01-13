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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CollectionImage {
  collectionName: string;
  image: { url: string };
  order?: number;
}

const Collections = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const { addItem } = useSavedItems();
  const { currentUser } = useAuth();

  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);
  const [images, setImages] = useState<CollectionImage[]>([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isAdded = currentUser?.savedItems?.collections?.map((col) => col.title)?.includes(selected);
  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  useEffect(() => {
    getCollectionImages().then((data) => {
      setImages(data);
    });
  }, []);

  // Check scroll position to show/hide chevrons
  const checkScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        carousel.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [images]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const clickHandler = (collection: CollectionImage | "") => {
    if (!collection) {
      setDisplayCol("");
      setSelected("");
      handleClick?.("");
      window.scrollTo({ top: 0 });
      return;
    }

    trackCTA(`Collection select-tile-${collection.collectionName}`);
    setDisplayCol(collections.filter((med) => med.collection === collection.collectionName));
    handleClick?.(collection.collectionName);
    setSelected(collection.collectionName);
    headerRef.current?.scrollIntoView({ behavior: "smooth" });
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
      image: image?.image?.url,
      contentType: "collection",
    };

    await addItem(collection);
  };

  return (
    <div className='collections'>
      <h2>RESZEN8 Collections</h2>
      <div className='collections__carousel-container'>
        {canScrollLeft && (
          <button
            className='collections__chevron collections__chevron--left'
            onClick={scrollLeft}
            aria-label='Scroll left'
          >
            <FaChevronLeft />
          </button>
        )}
        <div className='collections__cards' ref={carouselRef}>
          {images.map((col) => {
            return (
              <button onClick={() => clickHandler(col)} className='collections__card' key={col.collectionName}>
                <h3>{col.collectionName}</h3>
                <img
                  className={
                    selected === col.collectionName
                      ? "collections__card-image collections__card-image--active"
                      : "collections__card-image"
                  }
                  src={col.image.url}
                  alt={col.collectionName}
                />
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <button
            className='collections__chevron collections__chevron--right'
            onClick={scrollRight}
            aria-label='Scroll right'
          >
            <FaChevronRight />
          </button>
        )}
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
            {isAdded ? "Added to Your Journey" : "Add to Your Journey"}
          </button>
          <button className='collections__close-cta' onClick={() => clickHandler("")}>
            close collection
          </button>
          <AmbientEnv />
        </div>
      )}
      {displayCol.length > 0 && (
        <div className='collections__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sortByEpisode(displayCol).map((med, index) => {
            const imgSrc = images.find((im) => im.collectionName === med.collection)?.image?.url;

            return (
              <MeditationCard
                key={`${med.collection}-${med.episode}-${index}`}
                customTitle={
                  med.episode !== "0"
                    ? `${med.collection} - Meditation ${med.episode}: ${med.title}`
                    : `${med.collection}: ${med.title}`
                }
                item={med}
                showLike={false}
                customImage={imgSrc}
                isCollection
                i={index}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Collections;
