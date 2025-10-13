import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  size?: number;
  onClick?: () => void;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ isPlaying, size = 26, onClick }) => {
  const barWidth = size * 0.2;
  const barHeight = size * 0.6;
  const gap = size * 0.1;

  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundColor: "transparent",
        cursor: "pointer",
        padding: 0,
        background: "none",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <AnimatePresence initial={false}>
          {isPlaying ? (
            // Pause bars
            <>
              <motion.rect
                key='left-bar'
                x={size / 2 - barWidth - gap / 2}
                y={(size - barHeight) / 2}
                width={barWidth}
                height={barHeight}
                fill='#ffa500'
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transformOrigin='center'
                transition={{ duration: 0.3 }}
              />
              <motion.rect
                key='right-bar'
                x={size / 2 + gap / 2}
                y={(size - barHeight) / 2}
                width={barWidth}
                height={barHeight}
                fill='#ffa500'
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transformOrigin='center'
                transition={{ duration: 0.3 }}
              />
            </>
          ) : (
            // Play triangle
            <motion.polygon
              key='play-triangle'
              points={`${size / 3},${size / 4} ${size / 3},${(3 * size) / 4} ${(2 * size) / 3},${size / 2}`}
              fill='#ffa500'
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </svg>
    </button>
  );
};

export default PlayPauseButton;
