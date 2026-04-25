import { BuildState, ComponentType, PCComponent } from '../types';
import { Cpu, HardDrive, MemoryStick, Power, X } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getShortName } from '../utils/specMapper';

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

const TraceLine = ({ points, type, count = 1, isActive = true }: { key?: number | string, points: {x: number, y: number}[], type: 'data' | 'power', count?: number, isActive?: boolean }) => {
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

      const checkSegment = (pA: {x: number, y: number}, pB: {x: number, y: number}) => {
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
};

const GPUFan = ({ isActive = false }: { isActive?: boolean }) => (
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

interface CabinetProps {
  build: BuildState;
  onDrop: (component: PCComponent, index?: number) => void;
  onRemove: (type: ComponentType, index?: number) => void;
  activeDragType: ComponentType | null;
}

export function Cabinet({ build, onDrop, onRemove, activeDragType }: CabinetProps) {
  const [dragOverSlot, setDragOverSlot] = useState<{ type: ComponentType; index?: number } | null>(null);

  // TRACES SYSTEM: Global state for trace activation
  // The motherboard acts as the physical medium for data traces.
  // Traces will only be rendered/active if this is true.
  const isMotherboardInstalled = !!build.MOTHERBOARD;

  // TRACES SYSTEM: Step 1 - Add stable references
  // We need refs to calculate exact DOM positions because the layout uses flexbox
  // and is responsive. Static coordinates would misalign on different screen sizes.
  const containerRef = useRef<HTMLDivElement>(null);
  const cpuRef = useRef<HTMLDivElement>(null);
  const ramRef = useRef<HTMLDivElement>(null);
  const ssdRef = useRef<HTMLDivElement>(null);
  const gpuRef = useRef<HTMLDivElement>(null);
  const motherboardRef = useRef<HTMLDivElement>(null);
  const psuRef = useRef<HTMLDivElement>(null);

  // TRACES SYSTEM: Step 4 - Store trace points
  // Stores the computed (x, y) center points for each component slot
  const [tracePoints, setTracePoints] = useState<Record<string, Rect | null>>({
    cpu: null,
    ram: null,
    ssd: null,
    gpu: null,
    motherboard: null,
    psu: null
  });

  // TRACES SYSTEM: Step 3 - Compute slot positions
  // Converts global bounding rects into local coordinates relative to the inner cabinet
  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();

    const getRelativeRect = (ref: React.RefObject<HTMLDivElement>): Rect | null => {
      if (!ref.current) return null;
      const rect = ref.current.getBoundingClientRect();
      return {
        left: rect.left - parentRect.left,
        top: rect.top - parentRect.top,
        right: rect.right - parentRect.left,
        bottom: rect.bottom - parentRect.top,
        width: rect.width,
        height: rect.height,
        cx: rect.left - parentRect.left + rect.width / 2,
        cy: rect.top - parentRect.top + rect.height / 2,
      };
    };

    setTracePoints({
      cpu: getRelativeRect(cpuRef),
      ram: getRelativeRect(ramRef),
      ssd: getRelativeRect(ssdRef),
      gpu: getRelativeRect(gpuRef),
      motherboard: getRelativeRect(motherboardRef),
      psu: getRelativeRect(psuRef),
    });
  }, []);

  // TRACES SYSTEM: Step 5 - Handle responsiveness
  // Recalculate positions on mount and whenever the cabinet resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      calculatePositions();
    });

    observer.observe(container);
    window.addEventListener('resize', calculatePositions);
    
    // Initial calculation
    calculatePositions();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculatePositions);
    };
  }, [calculatePositions]);

  const handleDragOver = (e: React.DragEvent, type: ComponentType, index?: number) => {
    e.preventDefault();
    if (activeDragType === type) {
      setDragOverSlot({ type, index });
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, type: ComponentType, index?: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    try {
      const data = e.dataTransfer.getData('component');
      if (data) {
        const component = JSON.parse(data) as PCComponent;
        if (component.type === type) {
          onDrop(component, index);
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped component', err);
    }
  };

  const renderTraces = () => {
    if (!isMotherboardInstalled) return null;
    
    const t = tracePoints;
    // Wait for slot layout measurements (slots always exist even if empty)
    if (!t.cpu || !t.ram || !t.ssd || !t.gpu || !t.psu) return null;

    const hasCPU = !!build.CPU;
    const hasRAM = build.RAM.some(r => !!r);
    const hasSSD = !!build.SSD;
    const hasGPU = !!build.GPU;
    const hasPSU = !!build.PSU;

    const traces: { type: 'data' | 'power', count: number, points: {x: number, y: number}[], isActive: boolean }[] = [];

    // CPU -> RAM (data)
    traces.push({
      isActive: hasCPU && hasRAM,
      type: 'data',
      count: 4,
      points: [
        { x: t.cpu.right, y: t.cpu.cy },
        { x: t.cpu.right + 20, y: t.cpu.cy },
        { x: t.cpu.right + 20, y: t.ram.cy },
        { x: t.ram.left, y: t.ram.cy }
      ]
    });

    // CPU -> SSD (data)
    traces.push({
      isActive: hasCPU && hasSSD,
      type: 'data',
      count: 4,
      points: [
        { x: t.cpu.cx + 20, y: t.cpu.bottom },
        { x: t.cpu.cx + 20, y: t.cpu.bottom + 12 },
        { x: t.ssd.cx + 40, y: t.cpu.bottom + 12 },
        { x: t.ssd.cx + 40, y: t.ssd.top }
      ]
    });

    // CPU -> GPU (data)
    traces.push({
      isActive: hasCPU && hasGPU,
      type: 'data',
      count: 5,
      points: [
        { x: t.cpu.left + 20, y: t.cpu.bottom },
        { x: t.cpu.left + 20, y: t.cpu.bottom + 12 },
        { x: t.cpu.left - 20, y: t.cpu.bottom + 12 },
        { x: t.cpu.left - 20, y: t.gpu.top - 15 },
        { x: t.gpu.cx - 40, y: t.gpu.top - 15 },
        { x: t.gpu.cx - 40, y: t.gpu.top }
      ]
    });

    // PSU -> CPU (power)
    traces.push({
      isActive: hasPSU && hasCPU,
      type: 'power',
      count: 3,
      points: [
        { x: t.psu.left + 60, y: t.psu.top },
        { x: t.psu.left + 60, y: t.gpu.bottom + 20 },
        { x: t.gpu.left - 10, y: t.gpu.bottom + 20 },
        { x: t.gpu.left - 10, y: t.cpu.cy - 20 },
        { x: t.cpu.left, y: t.cpu.cy - 20 }
      ]
    });

    // PSU -> GPU (power)
    traces.push({
      isActive: hasPSU && hasGPU,
      type: 'power',
      count: 4,
      points: [
        { x: t.psu.right - 120, y: t.psu.top },
        { x: t.psu.right - 120, y: t.gpu.bottom }
      ]
    });

    // PSU -> SSD (power)
    traces.push({
      isActive: hasPSU && hasSSD,
      type: 'power',
      count: 3,
      points: [
        { x: t.psu.right - 60, y: t.psu.top },
        { x: t.psu.right - 60, y: t.gpu.bottom + 10 },
        { x: t.gpu.right + 15, y: t.gpu.bottom + 10 },
        { x: t.gpu.right + 15, y: t.ssd.bottom + 15 },
        { x: t.ssd.right - 40, y: t.ssd.bottom + 15 },
        { x: t.ssd.right - 40, y: t.ssd.bottom }
      ]
    });

    return traces.map((trace, i) => (
      <TraceLine key={i} points={trace.points} type={trace.type} count={trace.count} isActive={trace.isActive} />
    ));
  };

  const getSlotStyle = (type: ComponentType, index?: number, isFilled: boolean = false) => {
    const isMatch = activeDragType === type;
    const isOver = dragOverSlot?.type === type && dragOverSlot?.index === index;
    
    let baseStyle = `transition-all duration-200 flex items-center justify-center relative group ${type === 'RAM' ? 'rounded-[8px]' : 'rounded-2xl'} `;
    
    if (isOver) {
      baseStyle += "border border-slot-active bg-layer-2 shadow-[0_0_15px_rgba(172,181,210,0.3),inset_2px_2px_5px_rgba(0,0,0,0.5)] ";
    } else if (isMatch) {
      baseStyle += "border border-slot-active/70 bg-layer-1 shadow-[0_0_10px_rgba(172,181,210,0.1),inset_2px_2px_5px_rgba(0,0,0,0.5)] ";
    } else if (isFilled && (type === 'CPU' || type === 'SSD' || type === 'GPU' || type === 'PSU' || type === 'RAM' || type === 'MOTHERBOARD')) {
      baseStyle += "border border-cabinet-border/10 bg-layer-1/20 text-text-primary shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] ";
    } else {
      baseStyle += "border border-dashed border-cabinet-border/20 bg-base/40 text-text-primary shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.03)] ";
    }
    
    return baseStyle;
  };

  const renderFilledSlot = (component: PCComponent, onRemoveClick: () => void, isVertical = false) => {
    const isRam = component.type === 'RAM';
    const isCpu = component.type === 'CPU';
    const isSsd = component.type === 'SSD';
    const isGpu = component.type === 'GPU';
    const isPsu = component.type === 'PSU';
    const isMotherboard = component.type === 'MOTHERBOARD';

    const brandFontClass = component.brand.toLowerCase() === 'intel' 
      ? 'lowercase font-["Montserrat"] font-[800] tracking-tight' 
      : component.brand.toLowerCase() === 'amd'
      ? 'uppercase font-["Orbitron"] font-[900] tracking-widest'
      : 'uppercase font-extrabold tracking-widest';

    if (isMotherboard) {
      return (
        <div className="absolute inset-0 z-10 rounded-lg bg-gradient-to-br from-layer-2 to-panel border border-slot-active/20 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_1px_1px_1px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center p-1">
          <div className="w-full h-full rounded shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_1px_rgba(255,255,255,0.02)] flex items-center justify-center border border-base/40 bg-layer-1/50 relative overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <span className={`text-[9px] text-text-highlight/80 leading-tight ${brandFontClass}`}>
                {component.brand}
              </span>
              <span className="text-[10px] font-bold text-text-highlight tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                {getShortName(component.name)}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      );
    }

    if (isCpu) {
      return (
        <div className="absolute inset-0 z-10 rounded-[4px] bg-gradient-to-br from-[#2f6b4f] to-[#1f4a38] border border-[#1a3a2d] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.06),inset_0_0_4px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-[7px]">
          
          {/* Gold Pads (Full Perimeter) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4px]">
            {/* Top edge */}
            <div className="absolute top-1 left-3 right-3 flex justify-between px-0.5">
              {Array.from({ length: 14 }).map((_, i) => <div key={`t-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>
            {/* Bottom edge */}
            <div className="absolute bottom-1 left-3 right-3 flex justify-between px-0.5">
              {Array.from({ length: 14 }).map((_, i) => <div key={`b-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>
            {/* Left edge (top group) */}
            <div className="absolute left-1 top-3 flex flex-col gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => <div key={`lt-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>
            {/* Left edge (bottom group) */}
            <div className="absolute left-1 bottom-3 flex flex-col gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => <div key={`lb-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>
            {/* Right edge (top group) */}
            <div className="absolute right-1 top-3 flex flex-col gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => <div key={`rt-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>
            {/* Right edge (bottom group) */}
            <div className="absolute right-1 bottom-3 flex flex-col gap-[3px]">
              {Array.from({ length: 5 }).map((_, i) => <div key={`rb-${i}`} className="w-[2px] h-[2px] rounded-full bg-gradient-to-b from-[#e8c96b] to-[#b59226]"></div>)}
            </div>

            {/* Corner Triangle Markers (Bottom Only) */}
            <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-gradient-to-br from-[#e8c96b] to-[#b59226] rotate-45"></div>
            <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-br from-[#e8c96b] to-[#b59226] rotate-45"></div>
          </div>

          {/* Layer 2: IHS Metal Slab */}
          <div className="w-full h-full rounded-[12px] bg-gradient-to-br from-[#f5f5f5] via-[#dcdcdc] to-[#bcbcbc] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.4)] relative flex flex-col items-center justify-center border border-[#c8c8c8]">
            
            {/* Specular Edge Highlight (Top Edge) */}
            <div className="absolute top-0 left-2 right-2 h-[1px] bg-white/70"></div>

            {/* CPU Text (Printed, not engraved) */}
            <div className="flex flex-col items-center justify-center z-10 px-1 text-center">
              <Cpu className="w-5 h-5 mb-0.5 text-[#2a2a2a]" />
              <span className={`text-[12px] text-[#2a2a2a] leading-tight mb-0.5 ${brandFontClass}`}>
                {component.brand}
              </span>
              <span className="text-[9px] font-bold text-[#2a2a2a] tracking-tight leading-tight">
                {getShortName(component.name)}
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (isSsd) {
      return (
        <div className="absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-layer-2 to-panel border border-slot-active/20 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_1px_1px_1px_rgba(255,255,255,0.05),inset_-1px_-1px_2px_rgba(0,0,0,0.4)] flex items-center p-1 pl-0">
          {/* NVMe Connector (Gold Strip) */}
          <div className="h-[70%] w-2 bg-[#E4CF93] rounded-r-sm border-y border-r border-base/50 shadow-[inset_1px_0_1px_rgba(255,255,255,0.4)] flex flex-col justify-evenly py-0.5 ml-[1px]">
            <div className="w-full h-[2px] bg-black/60"></div>
            <div className="w-full h-[2px] bg-black/60"></div>
            <div className="w-full h-[2px] bg-black/60"></div>
            <div className="w-full h-[2px] bg-black/60"></div>
          </div>
          
          {/* Main SSD Body */}
          <div className="flex-1 h-full ml-1.5 rounded-md shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_1px_rgba(255,255,255,0.02)] flex items-center justify-center border border-base/40 bg-layer-1/50 relative overflow-hidden">
            {/* Sticker / Label Area */}
            <div className="absolute inset-y-1.5 inset-x-2 bg-layer-1/90 border border-cabinet-border/10 rounded flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              <HardDrive className="w-3 h-3 text-text-primary/70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
              <div className="flex flex-col">
                <span className={`text-[8px] text-text-highlight/80 leading-none ${brandFontClass}`}>
                  {component.brand}
                </span>
                <span className="text-[9px] font-medium text-text-highlight tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  {getShortName(component.name)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      );
    }

    if (isGpu) {
      return (
        <div className="absolute inset-0 z-10 rounded-[14px] bg-gradient-to-br from-layer-2 to-panel border border-slot-active/20 shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_1px_1px_1px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(0,0,0,0.4)] flex flex-col p-1.5 pb-0">
          {/* Main GPU Body */}
          <div className="flex-1 w-full rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] border border-base/30 bg-layer-1/80 flex items-center px-6 relative overflow-hidden">
            
            {/* Left Section: Label */}
            <div className="flex-1 flex justify-start items-center pl-2">
              <div className="bg-panel/80 px-4 py-2 rounded border border-cabinet-border/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col">
                  <span className={`text-[10px] text-text-highlight/80 leading-tight ${brandFontClass}`}>
                    {component.brand}
                  </span>
                  <span className="text-sm font-bold text-text-highlight tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {getShortName(component.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section: Fans */}
            <div className="flex gap-6 h-full items-center">
              <GPUFan isActive={!!build.PSU} />
              <GPUFan isActive={!!build.PSU} />
            </div>
          </div>

          {/* PCI Connector (Bottom Edge) */}
          <div className="h-1.5 w-1/3 mx-auto bg-[#E4CF93] rounded-b-sm border-x border-b border-base/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex justify-evenly items-end overflow-hidden">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-[1px] h-[80%] bg-black/60"></div>
            ))}
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (isRam) {
      return (
        <div className="absolute inset-0 z-10 rounded-[8px] bg-[#313231] border border-slot-active/20 shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_1px_0_2px_rgba(255,255,255,0.1),inset_-1px_0_2px_rgba(0,0,0,0.4)] transition-all duration-300 group">
          <div className="absolute inset-0 rounded-[8px] overflow-hidden flex flex-col">
            {/* Surface Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20 pointer-events-none"></div>
            
            {/* Top Notch */}
            <div className="absolute top-4 left-0 right-0 h-[1px] bg-black/40 shadow-[0_1px_0_rgba(255,255,255,0.05)] pointer-events-none"></div>

            {/* Edge Bevels (Left highlight, Right shadow) */}
            <div className="absolute inset-y-0 left-0 w-[1px] bg-white/10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/40 pointer-events-none"></div>

            {/* Main Body (Text) */}
            <div className="flex-1 flex items-center justify-center relative">
              <span className="text-[9px] font-bold text-[#FFFFFF] tracking-widest -rotate-90 whitespace-nowrap">
                {getShortName(component.name)}
              </span>
            </div>

            {/* Contact Strip (Pins) */}
            <div className="h-2.5 w-full bg-[#E4CF93] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] flex justify-evenly items-end pb-[1px] px-0.5 relative z-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[1px] h-[80%] bg-black/60"></div>
              ))}
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#522926] hover:bg-[#7a3d39] border border-white/10 flex items-center justify-center text-[#FFFFFF] opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-20"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      );
    }

    if (isPsu) {
      return (
        <div className="absolute inset-0 z-10 rounded-[14px] bg-gradient-to-br from-layer-2 to-panel border border-base/50 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.6)] flex items-center px-8">
          
          {/* Left Section: Fan / Vent */}
          <div className="flex-none">
            <div className="w-24 h-24 rounded-full border-4 border-layer-2 bg-panel shadow-[inset_3px_3px_10px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
              {/* Static Fan Grill */}
              <div className="absolute inset-1 rounded-full border-2 border-layer-2/40 flex items-center justify-center">
                <div className="absolute w-full h-[2px] bg-layer-2/30 rotate-0"></div>
                <div className="absolute w-full h-[2px] bg-layer-2/30 rotate-45"></div>
                <div className="absolute w-full h-[2px] bg-layer-2/30 rotate-90"></div>
                <div className="absolute w-full h-[2px] bg-layer-2/30 rotate-[135deg]"></div>
                {/* Concentric rings for grill effect */}
                <div className="absolute w-[70%] h-[70%] rounded-full border-[2px] border-layer-2/20"></div>
                <div className="absolute w-[40%] h-[40%] rounded-full border-[2px] border-layer-2/20"></div>
                {/* Center Hub */}
                <div className="w-8 h-8 rounded-full bg-layer-1 border border-layer-2/40 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10"></div>
              </div>
            </div>
          </div>

          {/* Right Section: Label */}
          <div className="flex-1 flex flex-col justify-center items-end pr-2">
            <div className="bg-panel/60 px-5 py-3 rounded border border-cabinet-border/5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] text-right">
              <div className="text-[10px] font-bold text-text-primary tracking-[0.2em] mb-1 uppercase opacity-80">Power Supply</div>
              <div className="flex flex-col items-end">
                <span className={`text-[11px] text-text-highlight/80 leading-tight ${brandFontClass}`}>
                  {component.brand}
                </span>
                <span className="text-base font-bold text-text-highlight tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {getShortName(component.name)}
                </span>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div className={`absolute inset-0 border flex flex-col items-center justify-center p-2 z-10 rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.6),inset_1px_1px_0px_rgba(255,255,255,0.15)] ${isRam ? 'bg-ram-filled border-ram-filled/50' : 'bg-layer-2 border-cabinet-border/30'}`}>
        <div className={`flex flex-col items-center justify-center ${isVertical ? 'rotate-90 whitespace-nowrap' : ''}`}>
          <span className={`text-[9px] text-text-highlight/80 leading-tight ${brandFontClass}`}>
            {component.brand}
          </span>
          <span className={`text-[10px] font-bold uppercase text-center ${isRam ? 'text-base' : 'text-text-highlight'}`}>
            {getShortName(component.name)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveClick();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <main className="w-2/4 h-full flex items-center justify-center p-2 relative">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#D9D9D9 1px, transparent 1px), linear-gradient(90deg, #D9D9D9 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div 
        className={`w-full max-w-2xl h-full flex flex-col relative z-0 rounded-3xl overflow-hidden transition-all duration-300
          ${build.CABINET ? 'shadow-[0_20px_40px_rgba(0,0,0,0.35),inset_0_1.5px_0_rgba(255,255,255,0.7),inset_1px_0_0_rgba(255,255,255,0.35),inset_-2px_-2px_4px_rgba(0,0,0,0.25),inset_6px_0_12px_rgba(255,255,255,0.2),inset_-6px_0_12px_rgba(0,0,0,0.15)] border border-[#6f706c]' : 'bg-panel border border-cabinet-border/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.1)]'}
          ${activeDragType === 'CABINET' ? 'ring-2 ring-category-selected ring-offset-4 ring-offset-base' : ''}
          ${dragOverSlot?.type === 'CABINET' ? 'brightness-110' : ''}
        `}
        style={build.CABINET ? {
          backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 150px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 2px), linear-gradient(to bottom right, #bfc1bb, #8C8D88, #5f605c)'
        } : undefined}
        onDragOver={(e) => handleDragOver(e, 'CABINET')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'CABINET')}
      >
        
        {/* Cabinet Top Bar */}
        <div 
          className={`w-full h-14 ${build.CABINET ? 'border-b border-black/20 shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1.5px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(255,255,255,0.3)]' : 'bg-gradient-to-b from-[#2A2C2A] to-[#1A1C1A] border-b border-black/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'} flex items-center justify-between px-8 relative z-10 shrink-0`}
          style={build.CABINET ? {
            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 2px), linear-gradient(to bottom, #d4d5d0, #8a8b86)'
          } : undefined}
        >
          <div className={`absolute top-0 left-0 w-full h-[1px] ${build.CABINET ? 'bg-white/60' : 'bg-white/10'}`}></div>
          
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${build.CABINET ? 'bg-[#4CAF50] shadow-[0_0_8px_#4CAF50]' : 'bg-cabinet-border/50'}`}></div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-text-highlight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {build.CABINET ? build.CABINET.name : 'DRAG ENCLOSURE HERE'}
            </span>
          </div>

          {/* Top Vent Detail */}
          <div className="flex gap-1.5 opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1.5 h-4 bg-black rounded-full shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)]"></div>
            ))}
          </div>

          {build.CABINET && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove('CABINET');
              }}
              className="w-7 h-7 bg-[radial-gradient(circle_at_top_left,#6e6f6b,#3a3b39)] hover:bg-[radial-gradient(circle_at_top_left,#7e7f7b,#4a4b49)] border border-black/40 flex items-center justify-center text-white/90 transition-all rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]"
            >
              <X className="w-3.5 h-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            </button>
          )}
        </div>

        {/* Cabinet Inner Area */}
        <div 
          ref={containerRef}
          className={`flex-1 m-6 mt-4 relative flex flex-col pt-10 pb-6 px-10 rounded-2xl overflow-y-auto no-scrollbar transition-all duration-300
          ${build.CABINET 
            ? 'bg-[#0f1110] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),inset_-3px_-3px_6px_rgba(0,0,0,0.6),inset_10px_10px_20px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1),0_-1px_0_rgba(0,0,0,0.5)] border border-black' 
            : 'bg-gradient-to-br from-layer-2 to-panel border border-cabinet-border/5 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'}
        `}>
          
          {/* TRACES SYSTEM: Step 2 - Create SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {renderTraces()}
          </svg>

          {/* Left Vertical Depth Panel */}
          <div 
            className={`absolute inset-y-0 left-0 w-6 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.3)] border-r z-10 ${build.CABINET ? 'border-black/20' : 'bg-gradient-to-b from-panel to-base border-cabinet-border/5'}`}
            style={build.CABINET ? {
              backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 2px), linear-gradient(to bottom, #8C8D88, #5f605c)'
            } : undefined}
          ></div>
          
          {/* Top Row: CPU & RAM */}
          <div className="flex justify-between items-start mb-6 shrink-0 z-10 relative">
            {/* CPU Slot */}
            <div
              ref={cpuRef}
              className={`w-36 h-36 ${getSlotStyle('CPU', undefined, !!build.CPU)}`}
              onDragOver={(e) => handleDragOver(e, 'CPU')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'CPU')}
            >
              {build.CPU ? (
                renderFilledSlot(build.CPU, () => onRemove('CPU'))
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-60 text-text-primary">
                  <Cpu className="w-8 h-8 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
                  <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-center drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">CPU SOCKET</span>
                </div>
              )}
            </div>

            {/* RAM Slots */}
            <div ref={ramRef} className="flex gap-3 pr-4">
              {build.RAM.map((ram, i) => (
                <div
                  key={`ram-${i}`}
                  className={`w-8 h-40 ${getSlotStyle('RAM', i, !!ram)}`}
                  onDragOver={(e) => handleDragOver(e, 'RAM', i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'RAM', i)}
                >
                  {ram ? (
                    renderFilledSlot(ram, () => onRemove('RAM', i), true)
                  ) : (
                    <div className="opacity-30 flex items-center justify-center h-full text-text-primary">
                      <div className="w-[1px] h-full bg-cabinet-border shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* M.2 SSD Slot */}
          <div
            ref={ssdRef}
            className={`w-64 h-14 mt-2 shrink-0 z-10 relative ${getSlotStyle('SSD', undefined, !!build.SSD)}`}
            onDragOver={(e) => handleDragOver(e, 'SSD')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'SSD')}
          >
            {build.SSD ? (
              renderFilledSlot(build.SSD, () => onRemove('SSD'))
            ) : (
              <div className="flex items-center gap-4 opacity-60 w-full px-4 text-text-primary">
                <HardDrive className="w-5 h-5 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">SSD SOCKET</span>
                <div className="flex-1 border-b border-dashed border-cabinet-border shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>
              </div>
            )}
          </div>

          {/* GPU Slot */}
          <div
            ref={gpuRef}
            className={`w-full h-28 mt-6 mb-10 shrink-0 z-10 relative ${getSlotStyle('GPU', undefined, !!build.GPU)}`}
            onDragOver={(e) => handleDragOver(e, 'GPU')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'GPU')}
          >
            {build.GPU ? (
              renderFilledSlot(build.GPU, () => onRemove('GPU'))
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-60 text-text-primary w-full px-8">
                <div className="w-full h-6 border border-cabinet-border/30 flex gap-1 p-0.5 bg-base/80 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] rounded-sm">
                  <div className="w-1/4 bg-layer-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] rounded-sm"></div>
                  <div className="w-3/4 bg-layer-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] rounded-sm"></div>
                </div>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">GPU SOCKET</span>
              </div>
            )}
          </div>

          {/* Motherboard Slot */}
          <div
            ref={motherboardRef}
            className={`w-full h-14 mb-4 shrink-0 z-10 relative ${getSlotStyle('MOTHERBOARD', undefined, !!build.MOTHERBOARD)}`}
            onDragOver={(e) => handleDragOver(e, 'MOTHERBOARD')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'MOTHERBOARD')}
          >
            {build.MOTHERBOARD ? (
              renderFilledSlot(build.MOTHERBOARD, () => onRemove('MOTHERBOARD'))
            ) : (
              <div className="flex items-center justify-center opacity-60 text-text-primary w-full h-full">
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">MOTHERBOARD SOCKET</span>
              </div>
            )}
          </div>

          {/* PSU Slot */}
          <div className="mt-auto pt-4 border-t border-cabinet-border/10 relative z-10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5"></div>
            <div
              ref={psuRef}
              className={`w-full h-36 shrink-0 ${getSlotStyle('PSU', undefined, !!build.PSU)} !bg-base/80 !shadow-[inset_4px_4px_12px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.02)]`}
              onDragOver={(e) => handleDragOver(e, 'PSU')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'PSU')}
            >
              {build.PSU ? (
                renderFilledSlot(build.PSU, () => onRemove('PSU'))
              ) : (
                <div className="flex items-center justify-between px-8 opacity-60 w-full h-full text-text-primary">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">PSU SOCKET</span>
                  </div>
                  <Power className="w-12 h-12 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
                </div>
              )}
            </div>
          </div>

          {/* Phase 2: Tempered Glass Overlay */}
          {build.CABINET && (
            <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden border border-white/10 bg-[#f0f4f8]/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.25),inset_1px_1px_1px_rgba(255,255,255,0.25)]">
              {/* Base Reflection Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              
              {/* Diagonal Light Streak */}
              <div className="absolute -top-[10%] -right-[20%] w-[150%] h-[30%] bg-white/10 blur-md opacity-30 -rotate-[25deg] origin-top-right"></div>
              
              {/* Subtle Noise/Grain & Vignette */}
              <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.2)_100%)]"></div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
