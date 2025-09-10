import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";
import RadiatingWaves from "./Playing";
import { FaPlay } from "react-icons/fa";
const ThreeDotsLoader = () => (
  <div className='three-dots-loader'>
    <span />
    <span />
    <span />
  </div>
);

const AudioController = ({ audioUrl, isImmersive }: { audioUrl: string; isImmersive?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const currentAudio = useSelector(getCurrentAudio);
  const immersiveUrl = useSelector((state: any) => state.content.immersiveEnv.url);
  const dispatch = useDispatch();

  const timerRef = useRef<NodeJS.Timer | null>(null); // store interval ID in a ref

  // Calculate duration
  useEffect(() => {
    let voiceAudio: HTMLAudioElement | null = null;
    let immersiveAudio: HTMLAudioElement | null = null;

    const introDelay = isImmersive && immersiveUrl ? 6 : 1;

    const calculateDuration = () => {
      const voiceDuration = voiceAudio?.duration || 0;
      const immersiveDuration = immersiveAudio?.duration || 0;
      const total = introDelay + voiceDuration;
      const overallDuration = Math.max(total, immersiveDuration);
      setDuration(overallDuration);
      setCountdown(overallDuration);
    };

    voiceAudio = new Audio(audioUrl);
    voiceAudio.preload = "metadata";
    voiceAudio.addEventListener("loadedmetadata", calculateDuration);

    if (immersiveUrl) {
      immersiveAudio = new Audio(immersiveUrl);
      immersiveAudio.preload = "metadata";
      immersiveAudio.addEventListener("loadedmetadata", calculateDuration);
    }

    return () => {
      voiceAudio?.removeEventListener("loadedmetadata", calculateDuration);
      immersiveAudio?.removeEventListener("loadedmetadata", calculateDuration);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl, immersiveUrl, isImmersive]);

  // Update isPlaying based on Redux
  useEffect(() => {
    setIsPlaying(currentAudio.url === audioUrl);
    if (currentAudio.url !== audioUrl && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setCountdown(duration);
    }
  }, [currentAudio, audioUrl, duration]);

  const togglePlayPause = () => {
    if (!isPlaying) {
      dispatch(setCurrentAudio({ url: audioUrl, isImmersive: !!isImmersive }));

      if (timerRef.current) clearInterval(timerRef.current);
      let time = duration;
      setCountdown(time);

      timerRef.current = setInterval(() => {
        time -= 0.1; // smooth countdown
        if (time <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCountdown(0);
        } else {
          setCountdown(time);
        }
      }, 100);
    } else {
      dispatch(setCurrentAudio({ url: "", isImmersive: false }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // SVG circle parameters
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 + countdown / duration);

  return (
    <div className='audio-player__inner'>
      <button className='audio-btn-wrapper' onClick={togglePlayPause} disabled={isLoading}>
        {/* Countdown Ring */}
        <svg className='audio-btn-circle' width={100} height={100}>
          <circle
            cx={50}
            cy={50}
            r={radius}
            stroke='orange'
            strokeWidth={3}
            fill='transparent'
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />
        </svg>

        {/* Button content */}
        <div className='audio-btn-content'>
          <div className='audio-btn-inner' style={{ backgroundColor: "transparent" }}>
            {!isPlaying && <span className='audio-player__duration'>{formatTime(duration)}</span>}
            {isPlaying ? (
              <>
                {isPlaying && <span className='audio-player__countdown'>{formatTime(countdown)}</span>}
                <RadiatingWaves />
              </>
            ) : null}
            {isLoading && <ThreeDotsLoader />}
            {!isPlaying && !isLoading && (
              <span style={{ marginTop: -4 }}>
                <FaPlay size={24} />
              </span>
            )}
          </div>
        </div>

        {/* Countdown text */}
      </button>
    </div>
  );
};

export default AudioController;
