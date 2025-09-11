import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";
import RadiatingWaves from "./Playing";
import { HiPlay } from "react-icons/hi2";
import CircularScrubber from "./CircularScrubber";

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
  const [reportedTime, setReportedTime] = useState(0);

  const currentAudio = useSelector(getCurrentAudio);
  const immersiveUrl = useSelector((state: any) => state.content.immersiveEnv.url);
  const dispatch = useDispatch();
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // ✅ Holds pending scrub to freeze knob immediately
  const pendingSeekRef = useRef<number | null>(null);

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
      pendingSeekRef.current = null;
    }
  }, [currentAudio, audioUrl, duration]);

  const togglePlayPause = () => {
    if (!isPlaying) {
      dispatch(setCurrentAudio({ url: audioUrl, isImmersive: !!isImmersive }));

      if (timerRef.current) clearInterval(timerRef.current);
      let time = duration;
      setCountdown(time);

      timerRef.current = setInterval(() => {
        time -= 0.1;
        if (time <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCountdown(0);
          setReportedTime(0);
        } else {
          setCountdown(time);
          setReportedTime(duration - time);
        }
      }, 100);
    } else {
      dispatch(setCurrentAudio({ url: "", isImmersive: false }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(duration);
      setReportedTime(0);
      pendingSeekRef.current = null;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const onDragEnd = (time: number) => {
    pendingSeekRef.current = time; // freeze immediately
    setCountdown(duration - time);
    dispatch(
      setCurrentAudio({
        ...currentAudio,
        seekTime: time,
      })
    );
  };

  // Compute progress
  const usedTime = pendingSeekRef.current != null ? pendingSeekRef.current : reportedTime;
  const progress = duration > 0 ? usedTime / duration : 0;

  return (
    <div className='audio-player__inner'>
      <button className='audio-btn-wrapper' onClick={togglePlayPause} disabled={isLoading}>
        <div className='audio-btn-content'>
          <div className='audio-btn-inner' style={{ backgroundColor: "transparent" }}>
            {!isPlaying && <span className='audio-player__duration'>{formatTime(duration)}</span>}
            {isPlaying && (
              <>
                <span className='audio-player__countdown'>{formatTime(duration - usedTime)}</span>
                <RadiatingWaves />
              </>
            )}
            {isLoading && <ThreeDotsLoader />}
            {!isPlaying && !isLoading && <HiPlay size={28} style={{ marginTop: -4 }} />}
          </div>
        </div>
      </button>
      <CircularScrubber
        radius={45}
        stroke={3}
        progress={progress}
        duration={duration}
        knobRadius={5}
        isPlaying={isPlaying}
        onScrub={() => {}}
        onScrubEnd={onDragEnd}
        onClick={togglePlayPause}
      />
    </div>
  );
};

export default AudioController;
