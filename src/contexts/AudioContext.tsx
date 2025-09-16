import React, { createContext, useContext, ReactNode, useState, useRef, useCallback, useMemo } from "react";
import { Howl } from "howler";

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

  // Update time while audio is playing
  const startTimeUpdate = useCallback(() => {
    const interval = setInterval(() => {
      if (mainRef.current?.playing()) {
        setCurrentTime(mainRef.current.seek() as number);
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

        backingHowl.play(); // start backing immediately
        backingHowl.fade(0, 1, 1000); // fade in

        setTimeout(() => {
          mainHowl.play();
          startTimeUpdate();
        }, 2000); // delay main for immersive effect
      } else {
        mainHowl.play();
        startTimeUpdate();
      }

      setCurrentAudio(mainUrl);
      setPlaying(true);
    },
    [fadeOutBacking, startTimeUpdate]
  );

  const pause = useCallback(() => {
    mainRef.current?.pause();
    backingRef.current?.pause();
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    mainRef.current?.stop();
    backingRef.current?.stop();
    setCurrentTime(0);
    setPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    mainRef.current?.seek(time);
    backingRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

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
