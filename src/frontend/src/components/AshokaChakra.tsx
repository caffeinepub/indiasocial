interface AshokaChakraProps {
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export function AshokaChakra({
  size = 48,
  color = "#000080",
  className = "",
  animate = false,
}: AshokaChakraProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.36;
  const hubR = size * 0.08;
  const spokeW = size * 0.03;

  // Generate 24 spokes
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + hubR * Math.cos(rad);
    const y1 = cy + hubR * Math.sin(rad);
    const x2 = cx + innerR * Math.cos(rad);
    const y2 = cy + innerR * Math.sin(rad);
    return { x1, y1, x2, y2, angle };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ashoka Chakra"
      className={`${animate ? "animate-chakra-spin" : ""} ${className}`}
    >
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        stroke={color}
        strokeWidth={size * 0.04}
        fill="none"
      />
      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        stroke={color}
        strokeWidth={size * 0.015}
        fill="none"
      />
      {/* Spokes */}
      {spokes.map((s, spokeIdx) => (
        <line
          // biome-ignore lint/suspicious/noArrayIndexKey: SVG spokes are purely decorative, fixed count
          key={spokeIdx}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={color}
          strokeWidth={spokeW}
          strokeLinecap="round"
        />
      ))}
      {/* Hub */}
      <circle cx={cx} cy={cy} r={hubR} fill={color} />
    </svg>
  );
}
