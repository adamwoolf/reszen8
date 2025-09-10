import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";

const FADE_INTERVAL = 100; // ms
const FADEOUT_INTERVAL = 300; // ms
const FADE_STEP = 0.05; // volume step per tick

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const immersiveRef = useRef<HTMLAudioElement>(null);
  const fadeInRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutRef = useRef<NodeJS.Timeout | null>(null);

  const location = useLocation();
  const dispatch = useDispatch();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [immersiveReady, setImmersiveReady] = useState(false);

  const currentAudio = useSelector(getCurrentAudio);
  const immersiveEnv = useSelector((state: any) => state.content.immersiveEnv);

  // Reset audio when navigating to a new page
  useEffect(() => {
    dispatch(setCurrentAudio({ url: "", isImmersive: false }));
  }, [location, dispatch]);

  // Fade ambient in
  const fadeInAmbient = () => {
    const ambient = immersiveRef.current;
    if (!ambient) return;

    if (fadeInRef.current) clearInterval(fadeInRef.current);
    ambient.volume = 0;

    fadeInRef.current = setInterval(() => {
      if (ambient.volume < 0.5) {
        ambient.volume = Math.min(ambient.volume + FADE_STEP, 0.5);
      } else {
        clearInterval(fadeInRef.current!);
        fadeInRef.current = null;
      }
    }, FADE_INTERVAL);
  };

  // Fade ambient out
  const fadeOutAmbient = (onComplete?: () => void) => {
    const ambient = immersiveRef.current;
    if (!ambient) return;

    if (fadeOutRef.current) clearInterval(fadeOutRef.current);

    fadeOutRef.current = setInterval(() => {
      if (ambient.volume > 0) {
        ambient.volume = Math.max(ambient.volume - FADE_STEP, 0);
      } else {
        ambient.pause();
        ambient.currentTime = 0;
        clearInterval(fadeOutRef.current!);
        fadeOutRef.current = null;
        if (onComplete) onComplete(); // call callback after fade out
      }
    }, FADEOUT_INTERVAL);
  };

  // Cleanup fade timers on unmount
  useEffect(() => {
    return () => {
      if (fadeInRef.current) clearInterval(fadeInRef.current);
      if (fadeOutRef.current) clearInterval(fadeOutRef.current);
    };
  }, []);

  // Listen for immersive readiness
  useEffect(() => {
    const ambient = immersiveRef.current;
    if (!ambient) return;

    const handleCanPlay = () => setImmersiveReady(true);
    ambient.addEventListener("canplaythrough", handleCanPlay);

    return () => ambient.removeEventListener("canplaythrough", handleCanPlay);
  }, [immersiveEnv.url]);

  /**
   * Play a fresh track (called when currentAudio.url changes)
   */
  const playNewTrack = () => {
    const voice = audioRef.current;
    const ambient = immersiveRef.current;
    if (!voice) return;

    // Stop/reset everything first
    voice.pause();
    voice.currentTime = 0;
    if (ambient) {
      ambient.pause();
      ambient.currentTime = 0;
    }

    setIsPlaying(false);
    setIsLoading(false);

    if (!currentAudio.url) return; // user pressed stop

    setIsLoading(true);

    // Handle immersive background
    if (ambient && currentAudio.isImmersive) {
      ambient.currentTime = 0;
      ambient.volume = 0;
      ambient.loop = true;

      const startAmbient = () =>
        ambient
          .play()
          .then(fadeInAmbient)
          .catch((err) => console.warn("Ambient play error:", err));

      if (immersiveReady) {
        startAmbient();
      } else {
        const onReady = () => {
          startAmbient();
          setImmersiveReady(true);
          ambient.removeEventListener("canplaythrough", onReady);
        };
        ambient.addEventListener("canplaythrough", onReady);
      }
    }

    // Start voice after introDelay
    const introDelay = currentAudio.isImmersive ? 6 : 1;
    setTimeout(() => {
      voice.currentTime = 0;
      voice.volume = 0.3;
      voice
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Voice playback error:", err);
          setIsPlaying(false);
          setIsLoading(false);
        });

      // Fade out immersive when voice ends, then clear Redux
      const handleVoiceEnd = () => {
        if (ambient) {
          fadeOutAmbient(() => {
            dispatch(setCurrentAudio({ url: "", isImmersive: false }));
          });
        } else {
          dispatch(setCurrentAudio({ url: "", isImmersive: false }));
        }
        voice.removeEventListener("ended", handleVoiceEnd);
        setIsPlaying(false);
      };
      voice.addEventListener("ended", handleVoiceEnd);
    }, introDelay * 1000);
  };

  /**
   * Toggle pause/resume for the current track
   */
  const togglePlayPause = () => {
    const voice = audioRef.current;
    const ambient = immersiveRef.current;
    if (!voice) return;

    if (isPlaying) {
      voice.pause();
      if (ambient) fadeOutAmbient();
      setIsPlaying(false);
    } else {
      voice
        .play()
        .then(() => {
          setIsPlaying(true);
          if (ambient && currentAudio.isImmersive) {
            ambient.play().catch(console.warn);
          }
        })
        .catch(console.error);
    }
  };

  // React to Redux URL changes
  useEffect(() => {
    playNewTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio.url]);

  // Track progress
  useEffect(() => {
    const voice = audioRef.current;
    const ambient = immersiveRef.current;
    if (!voice) return;

    const handleUpdate = () => {
      const introDelay = currentAudio.isImmersive ? 6 : 1;
      if (ambient) {
        if (voice.paused && ambient.currentTime < introDelay) {
          setCurrentTime(ambient.currentTime);
        } else {
          setCurrentTime(introDelay + voice.currentTime);
        }
      } else {
        setCurrentTime(voice.currentTime);
      }
    };

    voice.addEventListener("timeupdate", handleUpdate);
    if (ambient) ambient.addEventListener("timeupdate", handleUpdate);

    return () => {
      voice.removeEventListener("timeupdate", handleUpdate);
      if (ambient) ambient.removeEventListener("timeupdate", handleUpdate);
    };
  }, [currentAudio.isImmersive, immersiveEnv.url]);

  return (
    <div className='audio-player__inner'>
      <audio ref={audioRef} src={currentAudio.url} preload='metadata' />
      <audio ref={immersiveRef} src={immersiveEnv.url || ""} preload='auto' />
    </div>
  );
};

export default AudioPlayer;
