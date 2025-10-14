import React, { useState, useRef } from "react";
import "./VoiceOptions.scss";
import { FaPlay, FaPause } from "react-icons/fa";

type VoiceOption = {
  id: string;
  label: string;
  sampleUri: string;
};

type VoiceOptionsProps = {
  options: VoiceOption[];
  onSelect: (option: VoiceOption) => void;
  selectedId?: string;
};

export default function VoiceOptions({ options, onSelect, selectedId }: VoiceOptionsProps) {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSample = async (option: VoiceOption) => {
    try {
      // stop if same audio clicked
      if (currentPlayingId === option.id && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentPlayingId(null);
        return;
      }

      // stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // create new audio
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

  return (
    <div className='voice-options'>
      <h3 className='voice-options__title'>Select a Voice</h3>
      {options.map((option) => {
        const selected = selectedId === option.id;
        const playing = currentPlayingId === option.id;

        return (
          <div key={option.id} className={`voice-option ${selected ? "selected" : ""}`}>
            <button
              type='button'
              className={`radio-circle ${selected ? "checked" : ""}`}
              onClick={() => onSelect(option)}
            >
              {selected && <span className='inner-circle' />}
            </button>

            <span className='label'>{option.label}</span>

            <button type='button' className='play-button' onClick={() => playSample(option)}>
              {playing ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
