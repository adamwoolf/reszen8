import React, { createContext, useContext, ReactNode, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Howl } from "howler";
import { useLocation } from "react-router-dom";

type PlayerContextType = {
  currentAudio: string | null;
  playing: boolean;
  play: (mainUrl: string, backingUrl?: string, isImmersive?: boolean) => void;
  pause: () => void;
  reset: () => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mainRef = useRef<Howl | null>(null);
  const backingRef = useRef<Howl | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // store last positions to resume
  const lastPositionRef = useRef<{ main: number; backing: number }>({ main: 0, backing: 0 });

  const location = useLocation();

  const startTimeUpdate = useCallback(() => {
    const interval = setInterval(() => {
      if (mainRef.current?.playing()) {
        setCurrentTime(mainRef.current.seek() as number);
        lastPositionRef.current.main = mainRef.current.seek() as number;
        lastPositionRef.current.backing = (backingRef.current?.seek() as number) || 0;
      } else {
        clearInterval(interval);
        setPlaying(false);
      }
    }, 200);
  }, []);

  const fadeOutBacking = useCallback(() => {
    if (!backingRef.current) return;

    const backing = backingRef.current;
    if (!backing.playing()) return;

    const fadeDuration = 2000; // ms
    const steps = 20;
    const stepTime = fadeDuration / steps;
    const initialVol = backing.volume();
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVol = initialVol * (1 - currentStep / steps);
      backing.volume(Math.max(newVol, 0));
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        backing.stop();
        backing.volume(initialVol); // reset for next play
      }
    }, stepTime);
  }, []);

  const play = useCallback(
    (mainUrl: string, backingUrl?: string, isImmersive = false) => {
      // unload previous
      mainRef.current?.unload();
      backingRef.current?.unload();

      // Main Howl
      const mainHowl = new Howl({
        src: [mainUrl],
        html5: true,
        volume: 1,
        onend: () => {
          setPlaying(false);
          fadeOutBacking();
        },
        onload: () => setDuration(mainHowl.duration()),
      });
      mainRef.current = mainHowl;

      if (isImmersive && backingUrl) {
        const backingHowl = new Howl({
          src: [backingUrl],
          html5: true,
          loop: true,
          volume: 0,
        });
        backingRef.current = backingHowl;

        // play backing immediately, fade in
        backingHowl.play();
        backingHowl.fade(0, 1, 1000);

        // resume from last position if same track
        const startMainTime = currentAudio === mainUrl ? lastPositionRef.current.main : 0;
        const startBackingTime = currentAudio === mainUrl ? lastPositionRef.current.backing : 0;

        backingHowl.seek(startBackingTime);

        setTimeout(() => {
          mainHowl.seek(startMainTime);
          mainHowl.play();
          startTimeUpdate();
        }, 4000);
      } else {
        const startMainTime = currentAudio === mainUrl ? lastPositionRef.current.main : 0;
        mainHowl.seek(startMainTime);
        mainHowl.play();
        startTimeUpdate();
      }

      setCurrentAudio(mainUrl);
      setPlaying(true);
    },
    [fadeOutBacking, startTimeUpdate, currentAudio]
  );

  const pause = useCallback(() => {
    if (mainRef.current?.playing()) lastPositionRef.current.main = mainRef.current.seek() as number;
    if (backingRef.current?.playing()) lastPositionRef.current.backing = backingRef.current.seek() as number;

    mainRef.current?.pause();
    backingRef.current?.pause();
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    mainRef.current?.stop();
    backingRef.current?.stop();
    setCurrentTime(0);
    setPlaying(false);
    lastPositionRef.current = { main: 0, backing: 0 };
  }, []);

  const seek = useCallback((time: number) => {
    mainRef.current?.seek(time);
    backingRef.current?.seek(time);
    lastPositionRef.current = { main: time, backing: time };
    setCurrentTime(time);
  }, []);

  // stop all audio on route change
  useEffect(() => {
    reset();
  }, [location.pathname, reset]);

  const value = useMemo(
    () => ({
      currentAudio,
      playing,
      play,
      pause,
      reset,
      seek,
      currentTime,
      duration,
    }),
    [currentAudio, playing, currentTime, duration, play, pause, reset, seek]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
