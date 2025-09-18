function RadiatingWaves({ size = 70, color = "#ffffff", count = 2, duration = 6, isActive = true, border = 4 }) {
  const circles = Array.from({ length: count });
  return (
    <div
      className={`ripple ${!isActive ? "paused" : ""}`}
      style={{
        "--size": `${size}px`,
        "--color": color,
        "--duration": `${duration}s`,
        "--border": `${border}px`,
      }}
    >
      {circles.map((_, i) => (
        <span key={i} className='circle' style={{ animationDelay: `${(duration / count) * i}s` }} />
      ))}
    </div>
  );
}

export default RadiatingWaves;
