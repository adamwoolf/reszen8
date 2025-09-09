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
  allowBackground,
  isVisible = true,
}: {
  allowBackground?: boolean;
  audioUrl: string;
  isVisible?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const immersiveRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  const currentAudio = useSelector(getCurrentAudio);
  const immersiveEnv = useSelector((state: any) => state.content.immersiveEnv);
  const dispatch = useDispatch();

  const introDelay = immersiveEnv.url && allowBackground ? 6 : 1; // seconds

  // Load voice duration and add intro delay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration + introDelay);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl, introDelay]);

  // Progress updater
  useEffect(() => {
    let frame: number;
    const updateProgress = () => {
      if (isPlaying && sessionStart) {
        const elapsed = (Date.now() - sessionStart) / 1000; // in seconds
        setCurrentTime(Math.min(elapsed, duration));
      }
      frame = requestAnimationFrame(updateProgress);
    };
    frame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, sessionStart, duration]);

  const fadeInAmbient = () => {
    const ambient = immersiveRef.current;
    if (!ambient) return;

    ambient.volume = 0;
    setIsPlaying(true);
    setSessionStart(Date.now());

    ambient.play().catch((err) => console.error("Ambient play error:", err));

    const fade = setInterval(() => {
      if (ambient.volume < 0.5) {
        ambient.volume = Math.min(ambient.volume + FADE_STEP, 0.5);
      } else {
        clearInterval(fade);
      }
    }, FADE_INTERVAL);
  };

  const fadeOutAmbient = () => {
    const ambient = immersiveRef.current;
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
      dispatch(setCurrentAudio(""));
    } else {
      dispatch(setCurrentAudio(audioUrl));
    }
  };

  // Handle playback start / stop
  useEffect(() => {
    const voice = audioRef.current;

    if (!voice || !isVisible) return;

    if (currentAudio === audioUrl) {
      if (allowBackground) fadeInAmbient();

      setTimeout(() => {
        voice.currentTime = 0;
        voice.volume = 0.6;
        voice
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Playback error:", err);
            setIsPlaying(false);
          });
      }, introDelay * 1000);
    } else {
      voice.pause();
      setIsPlaying(false);
      fadeOutAmbient();
    }
  }, [currentAudio, audioUrl, allowBackground, introDelay, isVisible]);

  // Handle looping ambient if shorter than voice
  useEffect(() => {
    const audio = audioRef.current;
    const ambient = immersiveRef.current;
    if (!audio) return;

    const introOffset = 6; // seconds

    const handleUpdate = () => {
      if (allowBackground && ambient) {
        if (ambient.currentTime < introOffset && audio.paused) {
          // Ambient intro phase
          setCurrentTime(ambient.currentTime);
        } else {
          // Voice phase
          setCurrentTime(introOffset + audio.currentTime);
        }
      } else {
        // No ambient: just follow the voice track
        setCurrentTime(audio.currentTime);
      }
    };

    // Attach listeners
    if (allowBackground && ambient) {
      ambient.addEventListener("timeupdate", handleUpdate);
    }
    audio.addEventListener("timeupdate", handleUpdate);

    return () => {
      if (allowBackground && ambient) {
        ambient.removeEventListener("timeupdate", handleUpdate);
      }
      audio.removeEventListener("timeupdate", handleUpdate);
    };
  }, [allowBackground]);

  // Seek handler
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    const voice = audioRef.current;
    if (!voice) return;

    if (newTime < introDelay) {
      voice.pause();
      voice.currentTime = 0;
    } else {
      voice.currentTime = newTime - introDelay;
      if (isPlaying && voice.paused) voice.play();
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
      <audio ref={audioRef} src={audioUrl} preload='metadata' />
      {allowBackground && <audio ref={immersiveRef} src={immersiveEnv.url || ""} preload='auto' />}

      <button
        onClick={togglePlayPause}
        className={!isPlaying ? "dashboard-button audio-btn" : "dashboard-button audio-btn audio-btn--playing"}
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
