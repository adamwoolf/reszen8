import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { usePlayer } from "../../contexts/AudioContext";
import { useSelector } from "react-redux";
import CircularScrubber from "./CircularScrubber";
import RadiatingWaves from "./Playing";
import PlayPauseButton from "./PlayPauseIcon";

const ThreeDotsLoader = () => (
  <div className='three-dots-loader'>
    <span />
    <span />
    <span />
  </div>
);

const AudioController = ({ audioUrl, isImmersive }: { audioUrl: string; isImmersive?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [duration, setDuration] = useState(0);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const { currentAudio, playing, play, pause, reset, seek, currentTime } = usePlayer();

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
    if (currentAudio === audioUrl && playing) pause();
    else play(audioUrl, immersiveUrl, isImmersive);
  };

  const onScrubEnd = (time: number) => {
    seek(time);
  };

  const isCurrent = currentAudio === audioUrl;
  const usedTime = isCurrent ? currentTime : 0;
  const safeDuration = duration || 1;
  const progress = Math.min(Math.max(usedTime / safeDuration, 0), 1);
  const countdown = Math.max(duration - usedTime, 0);

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
            {isCurrent && playing && <RadiatingWaves />}
            <span className='audio-player__countdown'>{formatTime(countdown)}</span>
            {isLoading && <ThreeDotsLoader />}
            {!isLoading && (
              <div className='audio-player__icons'>
                <PlayPauseButton isPlaying={playing && isCurrent} />
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
        radius={55}
        stroke={2}
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
