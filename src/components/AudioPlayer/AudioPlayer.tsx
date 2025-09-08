import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";
import RadiatingWaves from "./Playing";

const FADE_INTERVAL = 100; // ms
const FADE_STEP = 0.05; // volume step per tick

const AudioPlayer = ({
  audioUrl,
  ambientUrl,
  allowBackground,
  isVisible,
}: {
  allowBackground?: boolean;
  audioUrl: string;
  ambientUrl?: string;
  isVisible?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const currentAudio = useSelector(getCurrentAudio);
  const dispatch = useDispatch();
  const ambientEnv = useSelector((state) => state.content.ambientEnv);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      fadeOutAmbient();
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

  const fadeInAmbient = () => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    ambient.volume = 0;
    setIsPlaying(true);
    ambient.play().catch((err) => console.error("Ambient play error:", err));
    const fade = setInterval(() => {
      if (ambient.volume < 1) {
        ambient.volume = Math.min(ambient.volume + FADE_STEP, 0.5);
      } else {
        clearInterval(fade);
      }
    }, FADE_INTERVAL);
  };

  const fadeOutAmbient = () => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    const fade = setInterval(() => {
      if (ambient.volume > 0) {
        ambient.volume = Math.max(ambient.volume - FADE_STEP, 0);
      } else {
        ambient.pause();
        clearInterval(fade);
        setIsPlaying(false);
      }
    }, FADE_INTERVAL);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      fadeOutAmbient();
      dispatch(setCurrentAudio("")); // stop globally
      setWasManuallyPlayed(false);
    } else {
      dispatch(setCurrentAudio(audioUrl));
      setWasManuallyPlayed(true);
    }
  };

  useEffect(() => {
    // if (!allowBackground) return;
    const ambient = ambientRef.current;
    const voice = audioRef.current;
    if (!ambient || !voice) return;

    const handleAmbientEnded = () => {
      // if main voice is still playing, restart ambient
      if (!voice.paused && !voice.ended) {
        ambient.currentTime = 0;
        ambient.play().catch((err) => console.error("Ambient replay error:", err));
      }
    };

    ambient.addEventListener("ended", handleAmbientEnded);
    return () => {
      ambient.removeEventListener("ended", handleAmbientEnded);
    };
  }, [allowBackground]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !isVisible) return;

    if (currentAudio === audioUrl && wasManuallyPlayed) {
      if (allowBackground) fadeInAmbient();
      setTimeout(
        () => {
          audio.volume = 0.6;

          audio
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("Playback error:", err);
              setIsPlaying(false);
            });
        },
        ambientEnv.url && allowBackground ? 6000 : 1000
      );
    } else {
      audio.pause();
      setIsPlaying(false);
      fadeOutAmbient();
    }
  }, [currentAudio, audioUrl, wasManuallyPlayed, ambientEnv.url, allowBackground, isVisible]);

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

  return (
    <div className='audio-player__inner'>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload='metadata'
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {allowBackground && <audio ref={ambientRef} src={allowBackground ? ambientEnv.url : ""} preload='auto' />}

      <button
        onClick={togglePlayPause}
        className={!isPlaying ? "dashboard-button audio-btn " : "dashboard-button audio-btn audio-btn--playing"}
      >
        {isPlaying ? (
          <RadiatingWaves />
        ) : (
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
              clipRule='evenodd'
            />
          </svg>
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
