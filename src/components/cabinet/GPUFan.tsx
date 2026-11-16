interface GPUFanProps {
  isActive?: boolean;
}

export function GPUFan({ isActive = false }: GPUFanProps) {
  return (
    <div className="relative w-20 h-20 rounded-full bg-[#050505] shadow-[inset_0_4px_12px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.05)] border border-[#1a1c1a] flex items-center justify-center z-10">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <defs>
          <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2D28" />
            <stop offset="100%" stopColor="#111310" />
          </linearGradient>
          <linearGradient id="bladeHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id="hubGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#3A3E38" />
            <stop offset="50%" stopColor="#1E201D" />
            <stop offset="100%" stopColor="#0A0B0A" />
          </radialGradient>
        </defs>

        {/* Outer Ring Inner Shadow */}
        <circle cx="50" cy="50" r="49" fill="none" stroke="#000" strokeWidth="2" opacity="0.6" />

        {/* Rotating Blades Group */}
        <g className={`origin-center ${isActive ? 'animate-spin-slow' : ''}`} style={{ transition: 'transform 0.3s ease' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 40} 50 50)`}>
              {/* Blade */}
              <path 
                d="M 45 37 Q 38 18 58 5 A 46 46 0 0 1 73 10 Q 58 25 55 37 Z" 
                fill="url(#bladeGrad)" 
              />
              {/* Specular Highlight */}
              <path 
                d="M 45 37 Q 38 18 58 5" 
                fill="none" 
                stroke="url(#bladeHighlight)" 
                strokeWidth="1" 
              />
            </g>
          ))}
          
          {/* Center Hub */}
          <circle cx="50" cy="50" r="15" fill="url(#hubGrad)" />
          {/* Hub Details */}
          <circle cx="50" cy="50" r="11" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.4" />
          <circle cx="50" cy="50" r="3" fill="#050505" />
        </g>
      </svg>
    </div>
  );
}
