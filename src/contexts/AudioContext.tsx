import React, { createContext, useContext, ReactNode, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

type PlayerContextType = {
  currentAudio: string | null;
  playing: boolean;
  loading: boolean;
  play: (mainUrl: string, backingUrl?: string, isImmersive?: boolean) => void;
  pause: () => void;
  reset: () => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
};

const PlayerContext = createContext<PlayerContextType | null>(null);
const FADE_BEFORE_END = 3; // seconds before the end to start fading

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const backingRef = useRef<HTMLAudioElement | null>(null);

  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const lastPositionRef = useRef<{ main: number; backing: number }>({ main: 0, backing: 0 });
  const rafRef = useRef<number | null>(null);

  const location = useLocation();

  /** Fade out backing audio */
  const fadeOutBacking = useCallback(() => {
    const backing = backingRef.current;
    if (!backing) return;

    const fadeDuration = 2000;
    const steps = 20;
    const stepTime = fadeDuration / steps;
    const startVolume = backing.volume;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVol = Math.max(startVolume * (1 - currentStep / steps), 0);
      backing.volume = newVol;
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        backing.pause();
        backing.currentTime = 0;
        backing.volume = startVolume;
      }
    }, stepTime);
  }, []);
  /** requestAnimationFrame loop to update currentTime smoothly */
  const startTimeUpdate = useCallback(() => {
    let fadeTriggered = false;

    const update = () => {
      if (mainRef.current && !mainRef.current.paused) {
        const current = mainRef.current.currentTime;
        const total = mainRef.current.duration || 0;
        setCurrentTime(current);
        lastPositionRef.current.main = current;
        lastPositionRef.current.backing = backingRef.current?.currentTime || 0;

        // trigger fade a few seconds before end
        if (!fadeTriggered && total > 0 && total - current <= FADE_BEFORE_END) {
          fadeTriggered = true;
          fadeOutBacking();
        }

        rafRef.current = requestAnimationFrame(update);
      } else {
        setPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(update);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [fadeOutBacking]);

  const play = useCallback(
    (mainUrl: string, backingUrl?: string, isImmersive = false) => {
      if (loading) return;

      // Stop previous audio
      mainRef.current?.pause();
      backingRef.current?.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const mainAudio = new Audio(mainUrl);
      mainRef.current = mainAudio;
      mainAudio.volume = 1;
      mainAudio.currentTime = currentAudio === mainUrl ? lastPositionRef.current.main : 0;

      mainAudio.onended = () => {
        setPlaying(false);
      };
      mainAudio.onloadedmetadata = () => setDuration(mainAudio.duration);

      if (isImmersive && backingUrl) {
        const backingAudio = new Audio(backingUrl);
        backingRef.current = backingAudio;
        backingAudio.loop = true;
        backingAudio.currentTime = currentAudio === mainUrl ? lastPositionRef.current.backing : 0;

        backingAudio.play();
        // simple fade in
        let step = 0;
        const fadeSteps = 20;
        const fadeInterval = setInterval(() => {
          step++;
          backingAudio.volume = Math.min(step / fadeSteps, 0.4);
          if (step >= fadeSteps) clearInterval(fadeInterval);
        }, 50);

        mainAudio.play();
        startTimeUpdate();
      } else {
        mainAudio.play();
        startTimeUpdate();
      }

      setCurrentAudio(mainUrl);
      setPlaying(true);
    },
    [currentAudio, fadeOutBacking, loading, startTimeUpdate]
  );

  const pause = useCallback(() => {
    if (mainRef.current && !mainRef.current.paused) lastPositionRef.current.main = mainRef.current.currentTime;
    if (backingRef.current && !backingRef.current.paused)
      lastPositionRef.current.backing = backingRef.current.currentTime;

    mainRef.current?.pause();
    backingRef.current?.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    mainRef.current?.pause();
    backingRef.current?.pause();
    mainRef.current && (mainRef.current.currentTime = 0);
    backingRef.current && (backingRef.current.currentTime = 0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCurrentTime(0);
    setPlaying(false);
    lastPositionRef.current = { main: 0, backing: 0 };
  }, []);

  const seek = useCallback((time: number) => {
    if (mainRef.current) mainRef.current.currentTime = time;
    if (backingRef.current) backingRef.current.currentTime = time;
    lastPositionRef.current = { main: time, backing: time };
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    reset();
  }, [location.pathname, reset]);

  const value = useMemo(
    () => ({
      currentAudio,
      playing,
      loading,
      play,
      pause,
      reset,
      seek,
      currentTime,
      duration,
    }),
    [currentAudio, playing, loading, currentTime, duration, play, pause, reset, seek]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
