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

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const backingRef = useRef<HTMLAudioElement | null>(null);

  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const lastPositionRef = useRef<{ main: number; backing: number }>({ main: 0, backing: 0 });
  const location = useLocation();

  // Update current time while playing
  const startTimeUpdate = useCallback(() => {
    const interval = setInterval(() => {
      if (mainRef.current && !mainRef.current.paused) {
        setCurrentTime(mainRef.current.currentTime);
        lastPositionRef.current.main = mainRef.current.currentTime;
        lastPositionRef.current.backing = backingRef.current?.currentTime || 0;
      } else {
        clearInterval(interval);
        setPlaying(false);
      }
    }, 200);
  }, []);

  const fadeOutBacking = useCallback(() => {
    if (!backingRef.current) return;
    const backing = backingRef.current;
    if (backing.paused) return;

    const fadeDuration = 2000;
    const steps = 20;
    const stepTime = fadeDuration / steps;
    const initialVol = backing.volume;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      backing.volume = Math.max(initialVol * (1 - currentStep / steps), 0);
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        backing.pause();
        backing.currentTime = 0;
        backing.volume = initialVol;
      }
    }, stepTime);
  }, []);

  const play = useCallback(
    (mainUrl: string, backingUrl?: string, isImmersive = false) => {
      if (loading) return; // ignore rapid clicks

      // setLoading(true);
      // setTimeout(() => setLoading(false), 2000); // fake loading

      // Unload previous audio
      mainRef.current?.pause();
      backingRef.current?.pause();

      const mainAudio = new Audio(mainUrl);
      mainRef.current = mainAudio;
      mainAudio.volume = 1;
      mainAudio.currentTime = currentAudio === mainUrl ? lastPositionRef.current.main : 0;

      mainAudio.onended = () => {
        setPlaying(false);
        fadeOutBacking();
      };
      mainAudio.onloadedmetadata = () => setDuration(mainAudio.duration);

      if (isImmersive && backingUrl) {
        const backingAudio = new Audio(backingUrl);
        backingRef.current = backingAudio;
        backingAudio.loop = true;
        backingAudio.volume = 0;
        backingAudio.currentTime = currentAudio === mainUrl ? lastPositionRef.current.backing : 0;

        backingAudio.play();
        // simple fade in
        let step = 0;
        const fadeSteps = 20;
        const fadeInterval = setInterval(() => {
          step++;
          backingAudio.volume = Math.min(step / fadeSteps, 1);
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
    [currentAudio, fadeOutBacking, startTimeUpdate, loading]
  );

  const pause = useCallback(() => {
    if (mainRef.current && !mainRef.current.paused) lastPositionRef.current.main = mainRef.current.currentTime;
    if (backingRef.current && !backingRef.current.paused)
      lastPositionRef.current.backing = backingRef.current.currentTime;

    mainRef.current?.pause();
    backingRef.current?.pause();
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    mainRef.current?.pause();
    backingRef.current?.pause();
    mainRef.current && (mainRef.current.currentTime = 0);
    backingRef.current && (backingRef.current.currentTime = 0);
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
