// components/AudioController.tsx
import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { HiPlay } from "react-icons/hi2";
import CircularScrubber from "./CircularScrubber";
import RadiatingWaves from "./Playing";
import { usePlayer } from "../../contexts/AudioContext";
import { useSelector } from "react-redux";

const ThreeDotsLoader = () => (
  <div className='three-dots-loader'>
    <span />
    <span />
    <span />
  </div>
);

const AudioController = ({ audioUrl, isImmersive }: { audioUrl: string; isImmersive?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const { currentAudio, playing, play, pause, seek, currentTime, getProgress, setBackingUrl } = usePlayer();

  const immersiveUrl = useSelector((state: any) => state.content?.immersiveEnv?.url);

  // visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.25 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  // preload metadata only when visible
  useEffect(() => {
    if (!isVisible) return;

    const t = new Audio(audioUrl);
    t.preload = "metadata";

    const onLoad = () => {
      // t.duration may be NaN in some cases; guard
      setDuration(Number.isFinite(t.duration) ? t.duration : 0);
      setIsLoading(false);
      // free the temp audio src after reading
      try {
        t.src = "";
      } catch {}
    };

    setIsLoading(true);
    t.addEventListener("loadedmetadata", onLoad);
    // start loading metadata
    // t.load(); browsers usually do it with preload attribute
    return () => {
      t.removeEventListener("loadedmetadata", onLoad);
      try {
        t.src = "";
      } catch {}
    };
  }, [audioUrl, isVisible]);

  // set backing url in provider when visible (so provider can start it when play() is called)
  useEffect(() => {
    if (isVisible && isImmersive && immersiveUrl) {
      setBackingUrl(immersiveUrl);
    } else if (!isVisible && isImmersive) {
      // optional: clear backing if you want to free it when controller leaves viewport
      // setBackingUrl(null);
    }
  }, [isVisible, isImmersive, immersiveUrl, setBackingUrl]);

  const togglePlayPause = () => {
    if (currentAudio === audioUrl && playing) pause();
    else play(audioUrl, isImmersive);
  };

  const onScrubEnd = (time: number) => {
    seek(audioUrl, time);
  };

  const isCurrent = currentAudio === audioUrl;
  const usedTime = isCurrent ? currentTime : getProgress(audioUrl);
  const countdown = duration > 0 ? Math.max(0, duration - usedTime) : 0;
  const progress = duration > 0 ? usedTime / duration : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className='audio-player__inner' ref={cardRef}>
      <button className='audio-btn-wrapper' onClick={togglePlayPause} disabled={isLoading}>
        <div className='audio-btn-content'>
          <div className='audio-btn-inner' style={{ backgroundColor: "transparent" }}>
            {!isCurrent && !isLoading && <span className='audio-player__duration'>{formatTime(duration)}</span>}
            {isCurrent && playing && (
              <>
                <RadiatingWaves />
              </>
            )}
            {isCurrent && <span className='audio-player__countdown'>{formatTime(countdown)}</span>}

            {isLoading && <ThreeDotsLoader />}
            {!isCurrent && !isLoading && <HiPlay size={28} style={{ marginTop: -4 }} />}
          </div>
        </div>
      </button>

      <CircularScrubber
        radius={45}
        stroke={3}
        progress={progress}
        duration={duration}
        knobRadius={7}
        isPlaying={isCurrent && playing}
        onScrub={() => {}}
        onScrubEnd={onScrubEnd}
      />
    </div>
  );
};

export default AudioController;
