import { X, Cpu, HardDrive } from 'lucide-react';
import { PCComponent } from '../../types';
import { getShortName } from '../../utils/specMapper';
import { GPUFan } from './GPUFan';

interface FilledSlotProps {
  component: PCComponent;
  onRemove: () => void;
  isVertical?: boolean;
  gpuFanActive?: boolean;
}

export function FilledSlot({ component, onRemove, isVertical = false, gpuFanActive = false }: FilledSlotProps) {
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
            <span className="text-[10px] font-bold text-text-highlight tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] truncate max-w-[120px]">
              {getShortName(component.name, 30)}
            </span>
            {component.summary && (
              <span className="text-[8px] font-medium text-[#8F9BAC] tracking-widest mt-0.5 whitespace-nowrap">
                {component.summary}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
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
            <span className="text-[9px] font-bold text-[#2a2a2a] tracking-tight leading-tight line-clamp-2 px-2 text-center max-w-full">
              {getShortName(component.name, 25)}
            </span>
            {component.summary && (
              <span className="text-[7px] font-medium text-[#4a4a4a] tracking-wider mt-0.5">
                {component.summary}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
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
              <span className="text-[9px] font-medium text-text-highlight tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] truncate max-w-[140px]">
                {getShortName(component.name, 26)}
              </span>
              {component.summary && (
                <span className="text-[7px] font-medium text-[#8F9BAC] tracking-widest mt-0.5 whitespace-nowrap">
                  {component.summary}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
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
                <span className="text-xs font-bold text-text-highlight tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate max-w-[200px]">
                  {getShortName(component.name, 35)}
                </span>
                {component.summary && (
                  <span className="text-[9px] font-medium text-category-selected tracking-widest mt-1">
                    {component.summary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Fans */}
          <div className="flex gap-6 h-full items-center">
            <GPUFan isActive={gpuFanActive} />
            <GPUFan isActive={gpuFanActive} />
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
            onRemove();
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
          <div className="flex-1 flex items-center justify-center relative -rotate-90">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-[#FFFFFF] tracking-widest whitespace-nowrap truncate max-w-[130px]">
                {getShortName(component.name, 22)}
              </span>
              {component.summary && (
                <span className="text-[7px] font-medium text-[#A0A0A0] tracking-widest whitespace-nowrap">
                  {component.summary.split(' • ')[0]}
                </span>
              )}
            </div>
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
            onRemove();
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
              <span className="text-xs font-bold text-text-highlight tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2 max-w-[180px] text-right">
                {getShortName(component.name, 35)}
              </span>
              {component.summary && (
                <span className="text-[10px] font-medium text-[#8F9BAC] tracking-wider mt-1">
                  {component.summary}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
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
          {getShortName(component.name, 30)}
        </span>
        {component.summary && (
          <span className="text-[8px] font-medium text-[#8F9BAC] tracking-wider mt-1 text-center whitespace-nowrap">
            {component.summary}
          </span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-[#282A29] hover:bg-[#4D2B27] border border-cabinet-border/20 flex items-center justify-center text-text-highlight opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)]"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
