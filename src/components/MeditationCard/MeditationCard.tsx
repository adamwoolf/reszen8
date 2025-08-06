import React from "react";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../../pages/Publications/LikeCta";

const MeditationCard = ({ item, i, showLike = true, handleAddItem }) => {
  const { currentUser } = useAuth();
  const hasBeenSaved = currentUser?.savedItems?.meditations?.some((m) => m.id === item.id);
  console.log(item);
  return (
    <article className='feature-card publication__card '>
      <div className='publication__card-content'>
        <div className='publication__card-inner'>
          <h3>{item.title}</h3>
          <div className='publication__card-divider' />

          {item.duration && <p>Duration: {item.duration}</p>}
          {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
          {/* {item.language && <p>Language: {item.language}</p>} */}
          {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}
        </div>
        <button disabled={hasBeenSaved} onClick={() => handleAddItem(item)} className='publication__card-save-cta'>
          {hasBeenSaved ? "Saved to dashboard" : "Save to my dashboard"}
        </button>
        {currentUser && showLike && <LikeCta id={item.id} content='meditations' />}
      </div>
    </article>
  );
};

export default MeditationCard;
