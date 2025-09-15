import React, { useState, useRef, useEffect } from "react";
import "./AudioPlayerStyles.scss";

const CircularScrubber = ({
  radius,
  stroke,
  progress,
  duration,
  isPlaying,
  onScrub,
  onScrubEnd,
  knobRadius,
}: {
  radius: number;
  stroke: number;
  progress: number; // 0 → 1
  duration: number;
  isPlaying: boolean;
  onScrub: (time: number) => void;
  onScrubEnd: (time: number) => void;
  knobRadius: number;
}) => {
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeProgress = dragging && dragProgress !== null ? dragProgress : progress;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference - activeProgress * circumference;

  const cx = radius + stroke / 2;
  const cy = radius + stroke / 2;

  const getAngle = (clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    return Math.atan2(dy, dx);
  };

  const getProgressFromAngle = (angle: number) => ((angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);

  const startDrag = (clientX: number, clientY: number) => {
    const angle = getAngle(clientX, clientY);
    const newProgress = getProgressFromAngle(angle);
    setDragProgress(newProgress);
    onScrub(newProgress * duration);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying) return;
    setDragging(true);
    const point = "touches" in e ? e.touches[0] : e;
    startDrag(point.clientX, point.clientY);

    if ("touches" in e) e.preventDefault(); // stop screen scroll
  };

  useEffect(() => {
    if (!dragging || !isPlaying) return;

    // Replace the end of your handleMove/handleUp logic:
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = e instanceof TouchEvent ? e.touches[0] : e;
      const angle = getAngle(point.clientX, point.clientY);
      const newProgress = getProgressFromAngle(angle);
      setDragProgress(newProgress);
      onScrub(newProgress * duration);

      if (e instanceof TouchEvent) e.preventDefault();
    };

    const handleUp = (e: MouseEvent | TouchEvent) => {
      const point = e instanceof TouchEvent ? e.changedTouches[0] : e;
      const angle = getAngle(point.clientX, point.clientY);
      const newProgress = getProgressFromAngle(angle);

      // ⚠️ Do NOT reset dragProgress here. Let parent control
      setDragging(false);
      onScrubEnd(newProgress * duration);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, isPlaying, duration, onScrub, onScrubEnd]);

  const angle = activeProgress * 2 * Math.PI - Math.PI / 2;
  const handleX = cx + radius * Math.cos(angle);
  const handleY = cy + radius * Math.sin(angle);

  return (
    <svg
      className='circular-scrubber'
      ref={svgRef}
      // onClick={onClick}
      width={radius * 2 + stroke}
      height={radius * 2 + stroke}
      style={{ cursor: isPlaying ? "grab" : "default", overflow: "visible", position: "absolute", top: -22 }}
    >
      {/* Base ring */}
      <circle stroke='orange' fill='none' cx={cx} cy={cy} r={radius} strokeWidth={stroke} />
      {/* Progress arc */}
      <circle
        stroke='#aa6b0d'
        fill='none'
        cx={cx}
        cy={cy}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Hitbox */}
      <circle
        cx={handleX}
        cy={handleY}
        r={Math.max(knobRadius, 14)}
        fill='transparent'
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      />

      {/* Visible knob with bidirectional arrows */}
      <g transform={`translate(${handleX}, ${handleY}) rotate(${(angle * 180) / Math.PI + 90})`} pointerEvents='none'>
        <polygon
          points='0,-10 11,0 0,10 -11,0'
          fill='goldenrod'
          stroke='#aa6b0d'
          strokeWidth={2}
          strokeLinejoin='round'
        />
      </g>
    </svg>
  );
};

export default CircularScrubber;
