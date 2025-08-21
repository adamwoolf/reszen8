import React from "react";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import LiquidWrapper from "../LiquidWrapper/LiquidWrapper";
import Icon from "../Icon/Icon";
import "./MeditationCardStyles.scss";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";

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
  const { addOrUpdate, deleteDocument } = useFirebasedatabase("meditations-static");

  const hasBeenSaved = currentUser?.savedItems?.meditations?.some((m) => m.id === item.id);

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setTimeout(() => window.location.reload(), 1000);
  };

  const verifyM = () => {
    addOrUpdate(item.firebaseId, { ...item, verified: true });
    setTimeout(() => window.location.reload(), 1000);
  };
  return (
    <LiquidWrapper>
      <article
        className={!item.staticMed ? "feature-card publication__card " : "feature-card publication__card static-med"}
      >
        <div className='publication__card-content'>
          <div className='publication__card-inner'>
            <h3 className='publication__card-title'>{item.title}</h3>
            <div className='publication__card-divider' />

            {item.duration && <p>Duration: {item.duration}</p>}
            {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
            {item.style && <p className='publication__card-meditation-type'>Meditation Style: {item.style}</p>}
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
        {currentUser && currentUser.isGod && !item.verified && item.staticMed && (
          <div>
            <button onClick={verifyM} style={{ marginRight: 12 }}>
              verify
            </button>
            <button onClick={() => handleDelete(item.firebaseId)} style={{ background: "red" }}>
              delete
            </button>
          </div>
        )}
      </article>
    </LiquidWrapper>
  );
};

export default MeditationCard;
