import React from "react";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import LiquidWrapper from "../LiquidWrapper/LiquidWrapper";
import Icon from "../Icon/Icon";

const MeditationCard = ({
  item,
  i,
  showLike = true,
  handleAddItem,
}: {
  handleAddItem?: (item: any) => void;
  showLike?: boolean;
  i: number;
  item: any;
}) => {
  const { currentUser } = useAuth();
  const hasBeenSaved = currentUser?.savedItems?.meditations?.some((m) => m.id === item.id);

  return (
    <LiquidWrapper>
      <article className='feature-card publication__card '>
        <div className='publication__card-content'>
          <div className='publication__card-inner'>
            <h3 className='publication__card-title'>{item.title}</h3>
            <div className='publication__card-divider' />

            {item.duration && <p>Duration: {item.duration}</p>}
            {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
            {/* {item.language && <p>Language: {item.language}</p>} */}
          </div>
          <div className='publication__card-inner'>
            {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}

            <button disabled={hasBeenSaved} onClick={() => handleAddItem(item)} className='publication__card-save-cta'>
              {hasBeenSaved ? "Saved to dashboard" : "Save to my dashboard"}
            </button>
          </div>
          <div className='publication__card-icon-container'>
            <Icon type={item.category[0].category} />
          </div>
          {currentUser && showLike && <LikeCta id={item.id} content='meditations' />}
        </div>
      </article>
    </LiquidWrapper>
  );
};

export default MeditationCard;
