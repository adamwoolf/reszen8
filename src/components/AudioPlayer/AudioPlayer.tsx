import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentAudio } from "../../store/contentSlice";
import { getCurrentAudio } from "../../store/contentSelectors";

const INTRO_DELAY_IMMERSIVE = 6;
const INTRO_DELAY_NON = 1;
const AMBIENT_MAX_VOL = 0.5;
const VOICE_VOL = 0.3;
const FADE_OUT_SEC = 3;
const FADE_IN_SEC = 2;

export default function AudioPlayer() {
  const dispatch = useDispatch();
  const currentAudio = useSelector(getCurrentAudio);
  const immersiveEnv = useSelector((s: any) => s.content.immersiveEnv);

  const voiceRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const voiceSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ambientSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const stopAll = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    if (voiceGainRef.current) voiceGainRef.current.gain.cancelScheduledValues(0);
    if (ambientGainRef.current) ambientGainRef.current.gain.cancelScheduledValues(0);

    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
    }
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
      ambientRef.current.volume = AMBIENT_MAX_VOL;
    }
    setIsPlaying(false);
  };

  // Only create AudioContext and sources once
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (voiceRef.current && !voiceSourceRef.current) {
      const source = ctx.createMediaElementSource(voiceRef.current);
      const gain = ctx.createGain();
      gain.gain.value = VOICE_VOL;
      source.connect(gain).connect(ctx.destination);
      voiceSourceRef.current = source;
      voiceGainRef.current = gain;
    }

    if (ambientRef.current && !ambientSourceRef.current) {
      const source = ctx.createMediaElementSource(ambientRef.current);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(ctx.destination);
      ambientSourceRef.current = source;
      ambientGainRef.current = gain;
    }
  };

  const fade = (gainNode: GainNode, from: number, to: number, durSec: number) => {
    const now = audioCtxRef.current!.currentTime;
    gainNode.gain.setValueAtTime(from, now);
    gainNode.gain.linearRampToValueAtTime(to, now + durSec);
  };

  const fadeInAmbient = () => {
    if (ambientGainRef.current) fade(ambientGainRef.current, 0, AMBIENT_MAX_VOL, FADE_IN_SEC);
  };

  const fadeOutAmbient = (onComplete?: () => void) => {
    if (ambientGainRef.current) {
      fade(ambientGainRef.current, ambientGainRef.current.gain.value, 0, FADE_OUT_SEC);
      fadeTimeoutRef.current = setTimeout(() => {
        ambientRef.current?.pause();
        ambientRef.current!.currentTime = 0;
        if (onComplete) onComplete();
      }, FADE_OUT_SEC * 1000);
    } else if (onComplete) onComplete();
  };

  const handlePlayClick = () => {
    // Resume AudioContext on user gesture
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();

    stopAll();
    if (!currentAudio.url) return;
    initAudioContext();

    const voice = voiceRef.current;
    const ambient = ambientRef.current;
    if (!voice) return;

    const introDelay = currentAudio.isImmersive ? INTRO_DELAY_IMMERSIVE : INTRO_DELAY_NON;

    if (currentAudio.isImmersive && ambient) {
      ambient.currentTime = 0;
      ambient.play().catch(() => {});
      fadeInAmbient();
    }

    setTimeout(() => {
      voice.currentTime = 0;
      voice
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.warn);

      const handleMetadata = () => {
        const duration = voice.duration;
        if (!isNaN(duration) && duration > 0) {
          fadeTimeoutRef.current = setTimeout(() => {
            fadeOutAmbient(() => {
              dispatch(setCurrentAudio({ url: "", isImmersive: false }));
              setIsPlaying(false);
            });
          }, (duration - FADE_OUT_SEC) * 1000);
        }
        voice.removeEventListener("loadedmetadata", handleMetadata);
      };
      voice.addEventListener("loadedmetadata", handleMetadata);

      const handleEnded = () => {
        fadeOutAmbient(() => {
          dispatch(setCurrentAudio({ url: "", isImmersive: false }));
          setIsPlaying(false);
        });
        voice.removeEventListener("ended", handleEnded);
      };
      voice.addEventListener("ended", handleEnded);
    }, introDelay * 1000);
  };

  return (
    <div className='audio-player__inner'>
      <button onClick={handlePlayClick}>{isPlaying ? "Pause" : "Play"}</button>
      <audio ref={voiceRef} src={currentAudio.url} preload='metadata' />
      <audio ref={ambientRef} src={immersiveEnv.url || ""} preload='auto' loop />
    </div>
  );
}
