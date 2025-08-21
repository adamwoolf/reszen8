import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";
import MakeAvailableOfflineButton from "../AvailableOfflineCta";

function NowPlaying() {
  return (
    <div className='now-playing'>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function RadiatingWaves({
  size = 48, // px
  color = "#ffffff", // white
  count = 3, // number of ripples
  duration = 5, // seconds per ripple
  isActive = true, // pause/play animation
  border = 4, // ring stroke width (px)
}) {
  // Stagger each circle so they loop seamlessly
  const circles = Array.from({ length: count });

  return (
    <div
      className={`ripple ${!isActive ? "paused" : ""}`}
      style={{
        // expose as CSS vars so CSS can read them
        "--size": `${size}px`,
        "--color": color,
        "--duration": `${duration}s`,
        "--border": `${border}px`,
      }}
    >
      {circles.map((_, i) => (
        <span
          key={i}
          className='circle'
          style={{
            animationDelay: `${(duration / count) * i}s`,
          }}
        />
      ))}
    </div>
  );
}

const AudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const currentAudio = useSelector(getCurrentAudio);
  const dispatch = useDispatch();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const [wasManuallyPlayed, setWasManuallyPlayed] = useState(false);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      dispatch(setCurrentAudio("")); // stop globally
      setWasManuallyPlayed(false);
    } else {
      dispatch(setCurrentAudio(audioUrl)); // request to play — let effect handle playback
      setWasManuallyPlayed(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentAudio === audioUrl && wasManuallyPlayed) {
      // Only auto-play if it was manually triggered
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback error:", err);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentAudio, audioUrl, wasManuallyPlayed]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // src/utils/cacheAudio.js
  const cacheAudio = async (url: string) => {
    const cache = await caches.open("firebase-audio");
    await cache.add(url);
    console.log(`Cached audio: ${url}`);
  };

  return (
    <div className='audio-player__inner'>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload='metadata'
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button
        onClick={togglePlayPause}
        className={!isPlaying ? "dashboard-button audio-btn " : "dashboard-button audio-btn audio-btn--playing"}
      >
        {isPlaying ? (
          <>
            <RadiatingWaves />
            {/* <span>Pause</span> */}
          </>
        ) : (
          <>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                clipRule='evenodd'
              />
            </svg>
            {/* <span>Play</span> */}
          </>
        )}
      </button>

      <div className='audio-slider-container'>
        <span>{formatTime(currentTime)}</span>
        <input
          className='custom-slider'
          type='range'
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleProgressChange}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
