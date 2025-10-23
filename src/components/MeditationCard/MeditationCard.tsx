import React, { useEffect, useRef, useState } from "react";
import AudioPlayer from "../AudioPlayer/AudioController";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import Icon from "../Icon/Icon";
import "./MeditationCardStyles.scss";
import { AWS_DB_ENDPOINT } from "../../constants";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { trackCTA } from "../../utils/analytics";
import { FaCheckCircle } from "react-icons/fa";

const INTRO_BUFFER = 6; // 6 seconds ambient intro

const MeditationCard = ({
  item,
  i,
  showLike = true,
  handleAddItem,
  customTitle,
  customImage,
  isCollection,
}: {
  handleAddItem?: (item: any) => void;
  showLike?: boolean;
  i: number;
  item: any;
  customTitle?: string;
  customImage?: string | boolean;
  isCollection?: boolean;
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
      className={
        !item.staticMed
          ? "feature-card publication__card meditation-card"
          : "feature-card publication__card meditation-card static-med"
      }
    >
      <div className='publication__card-content'>
        <div className='publication__card-inner'>
          <span className='publication__card-title'>{customTitle || item.title}</span>
          {item.immersive && <img alt='immersive-audio-icon' className='immersive-icon' src={immersiveLogo} />}
          {/* <span style={{ position: "absolute", top: 80, right: 14 }}>
            <FaCheckCircle color='green' size={17} />
          </span> */}
          <div className='publication__card-divider' />

          {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
          {item.style && <p className='publication__card-meditation-type'>Meditation Style: {item.style}</p>}
        </div>
        <div className='publication__card-inner'>
          {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} isImmersive={item.immersive} />}
          {!isCollection && (
            <button
              disabled={hasBeenSaved}
              onClick={() => {
                trackCTA(`Save meditation to My Journey-${item.title}`);
                handleAddItem?.(item);
              }}
              className='publication__card-save-cta'
            >
              {hasBeenSaved ? "Saved to My Journey" : "Save to My Journey"}
            </button>
          )}
        </div>
        {!customImage && (
          <div className='publication__card-icon-container'>
            <Icon type={item.category[0].category} />
          </div>
        )}
        {currentUser && showLike && <LikeCta item={item} id={item.uid} content='meditations' />}
      </div>
      {currentUser && currentUser.isGod && !item.verified && item.staticMed && (
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 100,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={verifyM}>verify</button>
          <button onClick={() => handleDelete(item.firebaseId)} style={{ background: "red" }}>
            delete
          </button>
        </div>
      )}
    </article>
  );
};

export default MeditationCard;
