// contexts/AudioContext.tsx
import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useMemo } from "react";

type PlayerContextType = {
  currentAudio: string | null;
  playing: boolean;
  play: (url: string) => void;
  pause: () => void;
  seek: (url: string, time: number) => void;
  currentTime: number;
  getProgress: (url: string) => number;
  setBackingUrl: (url: string | null) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const backingRef = useRef<HTMLAudioElement | null>(null);

  // state
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [backingUrl, setBackingUrl] = useState<string | null>(null);

  // keep a mutable ref to currentAudio for event handlers (avoid stale closures)
  const currentAudioRef = useRef<string | null>(null);
  useEffect(() => {
    currentAudioRef.current = currentAudio;
  }, [currentAudio]);

  // attach listeners once — to the real DOM <audio> elements (rendered below)
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const onTimeUpdate = () => {
      const t = main.currentTime;
      setCurrentTime(t);
      const key = currentAudioRef.current;
      if (key) {
        setProgressMap((prev) => {
          // avoid unnecessary setState if unchanged
          if (prev[key] === t) return prev;
          return { ...prev, [key]: t };
        });
      }
    };

    const onEnded = () => {
      setPlaying(false);
      // we keep progressMap as-is (so controllers remember last position)
    };

    main.addEventListener("timeupdate", onTimeUpdate);
    main.addEventListener("ended", onEnded);

    return () => {
      main.removeEventListener("timeupdate", onTimeUpdate);
      main.removeEventListener("ended", onEnded);
    };
  }, []); // run once

  // inside PlayerProvider

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const onTimeUpdate = () => {
      const t = main.currentTime;
      setCurrentTime(t);
      const key = currentAudioRef.current;
      if (key) {
        setProgressMap((prev) => {
          if (prev[key] === t) return prev;
          return { ...prev, [key]: t };
        });
      }
    };

    const onEnded = () => {
      setPlaying(false);
      fadeOutBacking(); // fade backing when voice finishes
    };

    main.addEventListener("timeupdate", onTimeUpdate);
    main.addEventListener("ended", onEnded);

    return () => {
      main.removeEventListener("timeupdate", onTimeUpdate);
      main.removeEventListener("ended", onEnded);
    };
  }, []);

  // helper to fade out backing audio
  const fadeOutBacking = () => {
    const backing = backingRef.current;
    if (!backing) return;

    let volume = backing.volume; // start from current
    const step = 0.05; // fade speed
    const interval = setInterval(() => {
      volume = Math.max(0, volume - step);
      backing.volume = volume;

      if (volume <= 0) {
        clearInterval(interval);
        backing.pause();
        backing.currentTime = 0;
        backing.volume = 1; // reset for next play
      }
    }, 100); // run every 100ms
  };

  const play = (url: string, isImmersive?: boolean) => {
    const main = mainRef.current;
    const backing = backingRef.current;
    if (!main) return;

    const lastProgress = progressMap[url] || 0;

    // If switching to a new track, set src and start from stored progress
    if (currentAudio !== url) {
      if (main.src !== url) main.src = url;
      // setting currentTime may throw if metadata not loaded — guard with try
      try {
        main.currentTime = lastProgress;
      } catch (e) {
        /* ignored */
      }
      setCurrentAudio(url);
      currentAudioRef.current = url;
      // ensure metadata will be loaded by browser when needed (preload attr on audio helps)
    }

    const fadeOutBacking = () => {
      console.log("FADING");
    };

    // Start backing if available
    if (backing && backingUrl && isImmersive) {
      try {
        if (backing.src !== backingUrl) backing.src = backingUrl;
        backing.loop = true;
        // attempt to align backing time with main
        try {
          backing.currentTime = lastProgress;
        } catch {}
        // play backing — may be blocked if not a user gesture but should succeed when called from click
        backing.play().catch(() => {
          /* ignore play errors (autoplay policies) */
        });
      } catch (e) {
        // ignore
      }
    }

    // Play main (wrap in catch to avoid uncaught promise)
    main.play().catch(() => {
      // play may reject under autoplay policies; UI can handle it
    });

    setPlaying(true);
  };

  const pause = () => {
    mainRef.current?.pause();
    backingRef.current?.pause();
    setPlaying(false);
  };

  const seek = (url: string, time: number) => {
    // update stored progress for that url
    setProgressMap((prev) => ({ ...prev, [url]: time }));

    // if the requested url is currently playing, update the actual audio elements
    if (url === currentAudio) {
      const main = mainRef.current;
      const backing = backingRef.current;
      if (main) {
        try {
          main.currentTime = time;
        } catch (_) {}
        setCurrentTime(time);
      }
      if (backing) {
        try {
          backing.currentTime = time;
        } catch (_) {}
      }
    }
  };

  const getProgress = (url: string) => progressMap[url] || 0;

  const value = useMemo(
    () => ({
      currentAudio,
      playing,
      play,
      pause,
      seek,
      currentTime,
      getProgress,
      setBackingUrl,
    }),
    [currentAudio, playing, currentTime, progressMap, backingUrl]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Two hidden audio elements that live in the DOM (prevents autoplay/gesture issues). */}
      <audio ref={mainRef} preload='metadata' style={{ display: "none" }} />
      <audio ref={backingRef} preload='metadata' style={{ display: "none" }} />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
