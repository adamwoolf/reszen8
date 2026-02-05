import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { usePlayer } from "../../contexts/AudioContext";
import { useSelector } from "react-redux";
import CircularScrubber from "./CircularScrubber";
import RadiatingWaves from "./Playing";
import PlayPauseButton from "./PlayPauseIcon";
import ThreeDotsLoader from "../ThreeDotsLoads";
import { trackCTA } from "../../utils/analytics";
import { FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setShowSignupModal } from "../../store/contentSlice";
import { useAuth } from "../../contexts/AuthContext";
import { categoriser } from "../../Util";

const AudioController = ({
  audioUrl,
  isImmersive,
  locked = false,
  contentType,
  item,
}: {
  audioUrl: string;
  isImmersive?: boolean;
  locked?: boolean;
  contentType?: string;
  item?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [duration, setDuration] = useState(0);
  const dispatch = useDispatch();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { currentUser, updateUser, setCurrentUser } = useAuth();

  const { currentAudio, playing, play, pause, reset, loading, seek, currentTime } = usePlayer();

  const immersiveUrl = useSelector((state: any) => state.content?.immersiveEnv?.url);

  // intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.25 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  // preload metadata
  useEffect(() => {
    if (!isVisible) return;
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";

    const onLoad = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setIsLoading(false);
    };

    setIsLoading(true);
    audio.addEventListener("loadedmetadata", onLoad);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoad);
      try {
        audio.src = "";
      } catch {}
    };
  }, [audioUrl, isVisible]);

  const togglePlayPause = () => {
    if (locked) {
      dispatch(setShowSignupModal(true));
      return;
    }
    trackCTA(`PlayPause-${audioUrl}`);
    if (currentAudio === audioUrl && playing) pause();
    else {
      trackUserActivity();
      setTimeout(() => play(audioUrl, immersiveUrl, isImmersive), 300);
    }
  };

  const isCurrent = currentAudio === audioUrl;
  const usedTime = isCurrent ? currentTime : 0;
  const safeDuration = duration || 1;
  const progress = Math.min(Math.max(usedTime / safeDuration, 0), 1);
  const countdown = Math.max(duration - usedTime, 0);

  // reset countdown/duration when track ends
  useEffect(() => {
    if (!isCurrent) return; // only reset for the active track
    if (duration > 0 && currentTime >= duration) {
      // wait a moment so the UI catches the last frame
      setTimeout(() => {
        reset(); // stops + resets playback in your AudioContext
        setDuration(duration); // keeps duration value so countdown shows correctly
      }, 300);
    }
  }, [currentTime, duration, isCurrent, reset]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const trackUserActivity = () => {
    if (!currentUser || !contentType) return;
    const category = item?.category?.[0]?.category || categoriser(item.content)?.[0]?.category;

    if (contentType === "meditations" && !item.collection) {
      const userMeditations = currentUser?.activity?.meditations || [];
      const meditationActivityArray = [...userMeditations, { id: item.uid, category, duration, timeStamp: Date.now() }];
      updateUser(currentUser?.uid, { activity: { ...currentUser?.activity, meditations: meditationActivityArray } });
      setCurrentUser({ ...currentUser, activity: { ...currentUser?.activity, meditations: meditationActivityArray } });
    }

    if (contentType === "meditations" && item.collection) {
      const userCollections = currentUser?.activity?.collections || [];
      const meditationActivityArray = [...userCollections, { id: item.uid, category, duration, timeStamp: Date.now() }];
      updateUser(currentUser?.uid, {
        activity: { ...currentUser?.activity, collections: meditationActivityArray },
      });
      setCurrentUser({ ...currentUser, activity: { ...currentUser?.activity, collections: meditationActivityArray } });
    }
  };

  return (
    <div style={isLoading ? { pointerEvents: "none" } : {}} className='audio-player__inner' ref={cardRef}>
      <button className={"audio-btn-wrapper"} onClick={togglePlayPause} disabled={isLoading}>
        <div className='audio-btn-content'>
          <div className='audio-btn-inner' style={{ backgroundColor: "transparent" }}>
            {isCurrent && playing && <RadiatingWaves />}
            {countdown > 0 && <span className='audio-player__countdown'>{formatTime(countdown)}</span>}
            {(isLoading || (currentAudio === audioUrl && loading)) && <ThreeDotsLoader />}
            {!isLoading && !locked && (
              <div className='audio-player__icons'>
                <PlayPauseButton isPlaying={playing && isCurrent} />
              </div>
            )}
            {locked && (
              <div className='audio-player__icons'>
                <FaLock />
              </div>
            )}
          </div>
        </div>
      </button>

      {isCurrent && currentTime > 0 && !playing && (
        <button className='audio-player__reset' onClick={reset}>
          Reset
        </button>
      )}

      <CircularScrubber
        radius={65}
        stroke={2}
        progress={progress}
        duration={duration}
        knobRadius={9}
        isPlaying={isCurrent && playing}
        onScrub={(time) => {
          // optional: show temporary progress while dragging
        }}
        onScrubEnd={(time) => {
          seek(time); // <-- updates AudioContext audio element
        }}
      />
    </div>
  );
};

export default AudioController;
