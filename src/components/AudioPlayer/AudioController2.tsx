import { usePlayer } from "../../contexts/AudioContext";

interface ControllerProps {
  audioUrl: string;
}

export const AudioController2: React.FC<ControllerProps> = ({ audioUrl }) => {
  const { currentAudio, playing, play, pause, seek, currentTime, duration } = usePlayer();
  const isCurrent = currentAudio === audioUrl;

  return (
    <div>
      <button onClick={() => (isCurrent && playing ? pause() : play(audioUrl))}>
        {isCurrent && playing ? "Pause" : "Play"} {duration}
      </button>

      {isCurrent && (
        <input
          type='range'
          min={0}
          max={duration || 0}
          value={currentTime || 0}
          onChange={(e) => seek(Number(e.target.value))}
        />
      )}
    </div>
  );
};

export default AudioController2;
