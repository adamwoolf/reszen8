import React, { useState, useRef } from "react";
import "./AudioPlayerStyles.scss";

interface Props {
  small?: boolean;
}

const CircularScrubber = ({
  radius,
  stroke,
  progress,
  duration,
  isPlaying,
  onScrub,
  onScrubEnd,
  knobRadius,
  disable,
  small,
}: Props) => {
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activeProgress = dragging && dragProgress !== null ? dragProgress : progress;

  const cx = radius + stroke * 2;
  const cy = radius + stroke * 2;
  const trackGap = stroke * 4;
  const outerRadius = radius + trackGap / 2;
  const innerRadius = radius - trackGap / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const outerOffset = outerCircumference - activeProgress * outerCircumference;
  const innerOffset = innerCircumference - activeProgress * innerCircumference;

  const getAngle = (x: number, y: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = x - (rect.left + rect.width / 2);
    const dy = y - (rect.top + rect.height / 2);
    return Math.atan2(dy, dx);
  };

  const angleToProgress = (angle: number) => ((angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);

  const startDrag = (clientX: number, clientY: number) => {
    if (disable) return;
    const angle = getAngle(clientX, clientY);
    const newProgress = angleToProgress(angle);
    setDragging(true);
    setDragProgress(newProgress);
    onScrub(newProgress * duration);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    const angle = getAngle(e.clientX, e.clientY);
    const newProgress = angleToProgress(angle);
    setDragProgress(newProgress);
    onScrub(newProgress * duration);
  };

  const handlePointerUp = (e: PointerEvent) => {
    const angle = getAngle(e.clientX, e.clientY);
    const newProgress = angleToProgress(angle);
    setDragging(false);
    setDragProgress(null);
    onScrubEnd(newProgress * duration);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPlaying) return;
    e.preventDefault(); // important for Safari to capture first click
    startDrag(e.clientX, e.clientY);
  };

  const angle = activeProgress * 2 * Math.PI - Math.PI / 2;
  const handleX = cx + radius * Math.cos(angle);
  const handleY = cy + radius * Math.sin(angle);

  return (
    <svg
      className='circular-scrubber'
      ref={svgRef}
      width={radius * 2 + stroke * 4}
      height={radius * 2 + stroke * 4}
      style={{
        cursor: isPlaying ? "grab" : "default",
        overflow: "visible",
        position: "absolute",
        top: !small ? -45 : -20,
      }}
      onPointerDown={handlePointerDown} // clicking anywhere starts drag immediately
    >
      <circle stroke='#ff9800' fill='none' cx={cx} cy={cy} r={outerRadius} strokeWidth={stroke} />
      <circle stroke='#ff9800' fill='none' cx={cx} cy={cy} r={innerRadius} strokeWidth={stroke} />
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
