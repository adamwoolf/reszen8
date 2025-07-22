import React, { useEffect, useRef, useState } from "react";
import "./AudioPlayerStyles.scss";
const AudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload='metadata'
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button onClick={togglePlayPause} className='dashboard-button audio-btn '>
        {isPlaying ? (
          <>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <span>Pause</span>
          </>
        ) : (
          <>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                clipRule='evenodd'
              />
            </svg>
            <span>Play</span>
          </>
        )}
      </button>

      <div className='audio-slider-container'>
        <span>{formatTime(currentTime)}</span>
        <input
          className='custom-slider'
          type='range'
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleProgressChange}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
