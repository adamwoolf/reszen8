import React, { useEffect, useState } from "react";
import { formatTime } from "../../components/AudioPlayer/AudioController";

const PlaylistItem = ({ audioUrl, progress }) => {
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    // if (!isVisible) return;
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";

    const onLoad = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    audio.addEventListener("loadedmetadata", onLoad);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoad);
      try {
        audio.src = "";
      } catch {}
    };
  }, [audioUrl]);
  const remainingPercent = ((duration - progress) / duration) * 100;

  return (
    <div className='playlist__time'>
      {/* <span>{formatTime(duration)}m</span>
      <span>{(duration - progress).toFixed(0)}</span> */}
      <span className='playlist__time-inner' style={{ width: `${remainingPercent.toFixed(3)}%` }} />
    </div>
  );
};

export default PlaylistItem;
