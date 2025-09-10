import React, { useEffect, useRef, useState } from "react";
import AudioPlayer from "../AudioPlayer/AudioController";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import Icon from "../Icon/Icon";
import "./MeditationCardStyles.scss";
import { AWS_DB_ENDPOINT } from "../../constants";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";

const INTRO_BUFFER = 6; // 6 seconds ambient intro

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
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const hasBeenSaved = currentUser?.savedItems?.meditations?.some((m) => m.uid === item.uid);

  const handleDelete = async (id: string) => {
    await fetch(`${AWS_DB_ENDPOINT}/deleteStaticMed`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: item.uid }),
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const verifyM = async () => {
    await fetch(`${AWS_DB_ENDPOINT}/updateStaticMed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: item.uid, verified: true }),
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  // Calculate and update duration
  useEffect(() => {
    if (isVisible && item.audioUrl && !item.duration) {
      const audio = new Audio(item.audioUrl);
      audio.addEventListener("loadedmetadata", async () => {
        let calculatedDuration = audio.duration;

        // If immersive (ambient intro), add intro buffer
        if (item.immersive) {
          calculatedDuration += INTRO_BUFFER;
        }
      });
    }
  }, [isVisible, item.audioUrl, item.duration, item.immersive, item.title, item.uid]);

  return (
    <article
      ref={cardRef}
      className={!item.staticMed ? "feature-card publication__card " : "feature-card publication__card static-med"}
    >
      <div className='publication__card-content'>
        <div className='publication__card-inner'>
          <h3 className='publication__card-title'>{item.title}</h3>
          {item.immersive && <img className='immersive-icon' src={immersiveLogo} />}

          <div className='publication__card-divider' />

          {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
          {item.style && <p className='publication__card-meditation-type'>Meditation Style: {item.style}</p>}
        </div>
        <div className='publication__card-inner'>
          {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} isImmersive={item.immersive} />}
          <button disabled={hasBeenSaved} onClick={() => handleAddItem?.(item)} className='publication__card-save-cta'>
            {hasBeenSaved ? "Saved to dashboard" : "Save to my dashboard"}
          </button>
        </div>
        <div className='publication__card-icon-container'>
          <Icon type={item.category[0].category} />
        </div>
        {currentUser && showLike && <LikeCta item={item} id={item.uid} content='meditations' />}
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
  );
};

export default MeditationCard;
