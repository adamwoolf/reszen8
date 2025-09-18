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

  // For each track
  const trackGap = stroke * 4; // space between the two tracks

  const outerRadius = radius + trackGap / 2;
  const innerRadius = radius - trackGap / 2;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const outerOffset = outerCircumference - activeProgress * outerCircumference;
  const innerOffset = innerCircumference - activeProgress * innerCircumference;

  const cx = radius + stroke * 2; // extra padding for dual track
  const cy = radius + stroke * 2;

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
    if ("touches" in e) e.preventDefault();
  };

  useEffect(() => {
    if (!dragging || !isPlaying) return;

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
      width={radius * 2 + stroke * 4}
      height={radius * 2 + stroke * 4}
      style={{ cursor: isPlaying ? "grab" : "default", overflow: "visible", position: "absolute", top: -45 }}
    >
      {/* Base outer track */}
      <circle stroke='#ff9800' fill='none' cx={cx} cy={cy} r={outerRadius} strokeWidth={stroke} />

      {/* Base inner track */}
      <circle stroke='#ff9800' fill='none' cx={cx} cy={cy} r={innerRadius} strokeWidth={stroke} />

      {/* Progress arc on outer track */}
      <circle
        stroke='#bbb'
        fill='none'
        cx={cx}
        cy={cy}
        r={outerRadius}
        strokeWidth={stroke}
        strokeDasharray={outerCircumference}
        strokeDashoffset={outerOffset}
        strokeLinecap='round'
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Progress arc on inner track */}
      <circle
        stroke='#bbb'
        fill='none'
        cx={cx}
        cy={cy}
        r={innerRadius}
        strokeWidth={stroke}
        strokeDasharray={innerCircumference}
        strokeDashoffset={innerOffset}
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

      {/* Visible knob spanning both tracks */}
      <g transform={`translate(${handleX}, ${handleY}) rotate(${(angle * 180) / Math.PI})`} pointerEvents='none'>
        <rect
          x={-knobRadius}
          y={-(trackGap + stroke) / 2}
          width={knobRadius * 2}
          height={trackGap + stroke}
          rx={knobRadius / 2}
          fill='#ff9800'
          stroke='#aa6b0d'
          strokeWidth={2}
        />
      </g>
    </svg>
  );
};

export default CircularScrubber;
