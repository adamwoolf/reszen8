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

  const lastEmitRef = useRef<number>(0);
  const THROTTLE_MS = 150; // throttle for audio-timeupdate event

  // Reset audio when navigating to a new page
  useEffect(() => {
    dispatch(setCurrentAudio({ url: "", isImmersive: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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

  // Update duration when voice loads
  useEffect(() => {
    const voice = audioRef.current;
    if (!voice) return;

    const handleLoadedMetadata = () => setDuration(voice.duration || 0);
    voice.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => voice.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [currentAudio.url]);

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

  useEffect(() => {
    playNewTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio.url]);

  // Track progress and emit events (throttled) for UI controllers
  useEffect(() => {
    const voice = audioRef.current;
    const ambient = immersiveRef.current;
    if (!voice) return;

    const emitTime = (t: number) => {
      try {
        window.dispatchEvent(new CustomEvent("audio-timeupdate", { detail: { time: t } }));
      } catch {
        // ignore older envs
      }
    };

    const handleUpdate = () => {
      const introDelay = currentAudio.isImmersive ? 6 : 1;
      let t = 0;
      if (ambient) {
        if (voice.paused && ambient.currentTime < introDelay) {
          t = ambient.currentTime;
        } else {
          t = introDelay + voice.currentTime;
        }
      } else {
        t = voice.currentTime;
      }
      setCurrentTime(t);

      const now = Date.now();
      if (now - lastEmitRef.current > THROTTLE_MS) {
        lastEmitRef.current = now;
        emitTime(t);
      }
    };

    voice.addEventListener("timeupdate", handleUpdate);
    if (ambient) ambient.addEventListener("timeupdate", handleUpdate);

    return () => {
      voice.removeEventListener("timeupdate", handleUpdate);
      if (ambient) ambient.removeEventListener("timeupdate", handleUpdate);
    };
  }, [currentAudio.isImmersive, immersiveEnv.url, dispatch]);

  // Handle seekTime requests from UI
  useEffect(() => {
    if (currentAudio.seekTime == null) return;

    const voice = audioRef.current;
    const ambient = immersiveRef.current;
    if (!voice) return;

    const introDelay = currentAudio.isImmersive ? 6 : 1;

    // Clamp seekTime between 0 and duration
    const targetTime = Math.max(0, Math.min(currentAudio.seekTime, duration));

    if (targetTime < introDelay) {
      // Seeking into intro section → adjust ambient only
      if (ambient) ambient.currentTime = targetTime;
      voice.currentTime = 0; // voice hasn't started yet
    } else {
      // Seeking after intro → adjust voice relative to introDelay
      voice.currentTime = targetTime - introDelay;
      if (ambient) ambient.currentTime = targetTime;
    }

    // Emit an immediate time update + seek-applied confirmation
    try {
      console.log("dispatching event", { detail: { time: targetTime } });
      window.dispatchEvent(new CustomEvent("audio-timeupdate", { detail: { time: targetTime } }));
      window.dispatchEvent(new CustomEvent("audio-seek-applied", { detail: { time: targetTime } }));
    } catch (err) {
      // swallow
    }

    // clear the seek request in Redux so this effect doesn't re-run repeatedly
    dispatch(setCurrentAudio({ ...currentAudio, seekTime: null }));
  }, [currentAudio.seekTime, currentAudio.isImmersive, duration, dispatch, currentAudio]);

  return (
    <div className='audio-player__inner'>
      <audio ref={audioRef} src={currentAudio.url} preload='metadata' />
      <audio ref={immersiveRef} src={immersiveEnv.url || ""} preload='auto' />
    </div>
  );
};

export default AudioPlayer;
