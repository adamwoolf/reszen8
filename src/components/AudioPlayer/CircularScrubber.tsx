import React from "react";

// ⭕ Circular Scrubber
const CircularScrubber = ({
  radius,
  stroke,
  progress,
  duration,
  isPlaying,
  onScrub,
  onScrubEnd,
}: {
  radius: number;
  stroke: number;
  progress: number;
  duration: number;
  isPlaying: boolean;
  onScrub: (time: number) => void;
  onScrubEnd: (time: number) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const getAngle = (clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    return Math.atan2(dy, dx);
  };

  const getProgressFromAngle = (angle: number) => {
    return ((angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying) return; // disable scrubbing when paused
    setDragging(true);
    const point = "touches" in e ? e.touches[0] : e;
    const angle = getAngle(point.clientX, point.clientY);
    const newProgress = getProgressFromAngle(angle);
    const newTime = newProgress * duration;
    onScrub(newTime);
  };

  useEffect(() => {
    if (!dragging || !isPlaying) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = e instanceof TouchEvent ? e.touches[0] : e;
      const angle = getAngle(point.clientX, point.clientY);
      const newProgress = getProgressFromAngle(angle);
      onScrub(newProgress * duration);
    };

    const handleUp = (e: MouseEvent | TouchEvent) => {
      const point = e instanceof TouchEvent ? e.changedTouches[0] : e;
      const angle = getAngle(point.clientX, point.clientY);
      const newProgress = getProgressFromAngle(angle);
      onScrubEnd(newProgress * duration);
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, isPlaying, duration, onScrub, onScrubEnd]);

  return (
    <svg
      ref={svgRef}
      width={radius * 2 + stroke}
      height={radius * 2 + stroke}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{ cursor: isPlaying ? "pointer" : "default" }}
    >
      <circle
        stroke='#eee'
        fill='none'
        cx={radius + stroke / 2}
        cy={radius + stroke / 2}
        r={radius}
        strokeWidth={stroke}
      />
      <circle
        stroke='white'
        fill='none'
        cx={radius + stroke / 2}
        cy={radius + stroke / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
        transform={`rotate(-90 ${radius + stroke / 2} ${radius + stroke / 2})`}
      />
    </svg>
  );
};
export default CircularScrubber;
