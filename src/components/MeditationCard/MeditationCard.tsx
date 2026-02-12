import React, { useEffect, useRef, useState } from "react";
import AudioPlayer from "../AudioPlayer/AudioController";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import Icon from "../Icon/Icon";
import "./MeditationCardStyles.scss";
import { AWS_DB_ENDPOINT } from "../../constants";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { trackCTA } from "../../utils/analytics";
import { FaShareAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { createToast } from "../../store/contentSlice";

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
  const dispatch = useDispatch();
  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 },
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

  const lockPlayback = i > 0 && !currentUser;

  function copyCurrentUrlToClipboard() {
    const encodedTitle = encodeURI(item.title);
    const url = `https://reszen8.com/meditation-library/${encodedTitle}`;

    // Use the modern Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log("URL copied to clipboard:", url);
        })
        .catch((err) => {
          console.error("Failed to copy URL:", err);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed"; // avoid scrolling to bottom
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand("copy");
        console.log(success ? "URL copied to clipboard" : "Copy failed");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }

      document.body.removeChild(textArea);
    }
  }

  const handleShareClick = () => {
    copyCurrentUrlToClipboard();
    dispatch(createToast({ text: `Copied like to ${item.title}`, type: "success" }));
  };

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
        <div
          className={
            lockPlayback && !currentUser
              ? "publication__card-inner"
              : "publication__card-inner publication__card-inner--with-badge"
          }
        >
          {!lockPlayback && !currentUser && <div className='free-preview-badge'>Free Preview</div>}
          <span className='publication__card-title'>{customTitle || item.title}</span>
          {item.immersive && <img alt='immersive-audio-icon' className='immersive-icon' src={immersiveLogo} />}

          <div className='publication__card-divider' />

          {item.type && <p className='publication__card-meditation-type'>Meditation Type: {item.type}</p>}
          {item.style && <p className='publication__card-meditation-type'>Meditation Style: {item.style}</p>}
        </div>
        <div className='publication__card-inner'>
          {item.audioUrl && (
            <AudioPlayer
              contentType='meditations'
              locked={lockPlayback}
              audioUrl={item.audioUrl}
              isImmersive={item.immersive}
              item={item}
            />
          )}
          <button onClick={handleShareClick} className='meditation-share-cta'>
            <FaShareAlt />
          </button>
          {!isCollection && currentUser && (
            <button
              disabled={hasBeenSaved}
              onClick={() => {
                trackCTA(`Save meditation to Your Journey-${item.title}`);
                handleAddItem?.(item);
              }}
              className='publication__card-save-cta'
            >
              {hasBeenSaved ? "Saved to Your Journey" : "Save to Your Journey"}
            </button>
          )}
        </div>
        {!customImage && (
          <div className='publication__card-icon-container'>
            <Icon type={item.category[0].category} />
          </div>
        )}
        {showLike && <LikeCta item={item} id={item.uid} content='meditations' />}
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
