import React, { useState } from "react";
import Popup from "../../components/Popup/Popup";
import MeditationCard from "../../components/MeditationCard/MeditationCard";
import "./CollectionOverlayStyles.scss";
import { sortByEpisode } from "../../Util";
import RemoveItemPopup from "./RemoveItemPopup";
const CollectionOverlay = ({
  collection,
  handleRemoveItem,
}: {
  collection: { title: string; episodes: any[]; id: string; image: string };
  handleRemoveItem;
}) => {
  const [show, setShow] = useState(false);
  const [itemIoRemove, setItemToRemove] = useState(null);
  const { title, image, episodes } = collection;

  return (
    <>
      <div className='collection-overlay__card-wrapper'>
        <button role='button' className='collection-overlay__cta' onClick={() => setShow(true)}>
          <h3>{title}</h3>
          <img src={image} />
        </button>
        <button className='collection__remove-cta' onClick={() => setItemToRemove(collection)}>
          remove
        </button>
      </div>
      <Popup show={show} onClose={() => setShow(false)}>
        <div className='collection-overlay'>
          <h3 className='collection-overlay__title'>{title}</h3>
          <div className='collection-overlay__grid'>
            {sortByEpisode(episodes)?.map((episode, index) => (
              <MeditationCard
                customTitle={
                  episode.episode !== "0"
                    ? ` Meditation ${episode.episode}: ${episode.title}`
                    : `${episode.collection}: ${episode.title}`
                }
                isCollection
                customImage={true}
                showLike={false}
                i={index}
                item={episode}
              />
            ))}
          </div>
        </div>
      </Popup>
      <RemoveItemPopup
        item={collection}
        show={!!itemIoRemove}
        onClose={() => setItemToRemove(null)}
        handleRemoveItem={handleRemoveItem}
      />
    </>
  );
};

export default CollectionOverlay;
