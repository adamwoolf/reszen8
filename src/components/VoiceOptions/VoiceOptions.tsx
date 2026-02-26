import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./VoiceOptions.scss";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";

type VoiceOption = {
  id: string;
  label: string;
  sampleUri?: string;
  description?: string;
  locked?: boolean;
};

type VoiceOptionsProps = {
  options: VoiceOption[];
  onSelect: (option: VoiceOption) => void;
  selectedId?: string;
  useLabelForActive?: boolean;
};

export default function VoiceOptions({ options, onSelect, selectedId, useLabelForActive }: VoiceOptionsProps) {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // 🎧 Audio playback logic (unchanged)
  const playSample = async (option: VoiceOption) => {
    try {
      if (currentPlayingId === option.id && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentPlayingId(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(option.sampleUri);
      audioRef.current = audio;
      setCurrentPlayingId(option.id);
      await audio.play();

      audio.onended = () => {
        setCurrentPlayingId(null);
      };
    } catch (err) {
      console.warn("Failed to play sample", err);
      setCurrentPlayingId(null);
    }
  };

  // 🟦 Move the highlight
  useEffect(() => {
    if (!selectedId || !highlightRef.current) return;

    const index = options.findIndex((o) => o.id === selectedId);
    const selectedEl = optionsRef.current[index];
    const containerEl = highlightRef.current.parentElement;

    if (selectedEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const optionRect = selectedEl.getBoundingClientRect();
      const top = optionRect.top - containerRect.top;
      const height = optionRect.height;

      highlightRef.current.style.transform = `translateY(${top}px)`;
      highlightRef.current.style.height = `${height}px`;
    }
  }, [selectedId, options]);

  // Stop audio when navigating away
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [location]);

  return (
    <div className='voice-options'>
      {/* <div ref={highlightRef} className='voice-options__highlight' /> */}
      <div className='voice-options-inner'>
        {options.map((option, i) => {
          const selected = !useLabelForActive ? selectedId === option.id : selectedId === option.label;
          const playing = currentPlayingId === option.id;

          return (
            <button
              ref={(el) => (optionsRef.current[i] = el)}
              key={option.id}
              type='button'
              className={`voice-option ${selected ? "selected" : ""} ${option.locked && "voice-option--locked"}`}
              onClick={() => onSelect(option)}
            >
              {option.locked && <FaLock className='voice-option-lock' />}
              <span className='voice-option--left'>
                <span className={`radio-circle ${selected ? "checked" : ""}`}>
                  {selected && <span className='inner-circle' />}
                </span>
                <span className='label'>
                  {option.label}
                  {option.description && ":"}
                  {option.description && <span className='voice-option__description'>{option.description}</span>}
                </span>
              </span>
              {option.sampleUri && (
                <button
                  type='button'
                  className='play-button'
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering select
                    playSample(option);
                  }}
                >
                  {playing ? <FaPause /> : <FaPlay />}
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
