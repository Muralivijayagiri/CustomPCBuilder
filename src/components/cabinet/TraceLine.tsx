export interface TracePoint {
  x: number;
  y: number;
}

interface TraceLineProps {
  points: TracePoint[];
  type: 'data' | 'power';
  count?: number;
  isActive?: boolean;
}

export function TraceLine({ points, type, count = 1, isActive = true }: TraceLineProps) {
  const activeColor = type === 'data' ? '#00FF85' : '#E5C56D';
  const color = isActive ? activeColor : 'rgba(30,32,30,0.9)';
  const opacity = isActive ? 1 : 0.4;
  const strokeWidth = isActive ? 1 : 1.4;
  const gap = 3.5; // 3.5px gap between parallel lines

  const lines = Array.from({ length: count }).map((_, i) => {
    const offset = (i - (count - 1) / 2) * gap;
    
    return points.map((p, index) => {
      let dx = 0;
      let dy = 0;

      const checkSegment = (pA: TracePoint, pB: TracePoint) => {
        if (Math.abs(pA.x - pB.x) > 0.1) dy = offset; // Horizontal segment -> offset Y
        if (Math.abs(pA.y - pB.y) > 0.1) dx = offset; // Vertical segment -> offset X
      };

      // Check incoming and outgoing segments to determine corner offsets
      if (index > 0) checkSegment(points[index - 1], p);
      if (index < points.length - 1) checkSegment(p, points[index + 1]);

      return { x: p.x + dx, y: p.y + dy };
    });
  });
  
  return (
    <g className="trace-bus" style={{ opacity, filter: isActive ? 'none' : 'contrast(1.1)', transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out' }}>
      {lines.map((linePoints, lineIndex) => {
        const path = `M ${linePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
        return (
          <g key={lineIndex}>
            <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease-in-out, stroke-width 0.3s ease-in-out' }} />
            {linePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={isActive ? "1.5" : "1.8"} fill={color} style={{ transition: 'fill 0.3s ease-in-out, r 0.3s ease-in-out' }} />
            ))}
          </g>
        );
      })}
    </g>
  );
}
