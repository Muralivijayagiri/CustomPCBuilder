import { ComponentType } from '../types';
import { X } from 'lucide-react';

interface BaseHardwareBlockProps {
  type: ComponentType;
  label: string;
  state?: 'default' | 'hover' | 'drag';
  onRemoveClick?: () => void;
}

export function BaseHardwareBlock({ type, label, state = 'default', onRemoveClick }: BaseHardwareBlockProps) {
  // Base styles
  let containerStyle = "absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center group transition-all duration-200 cursor-pointer overflow-hidden ";
  
  // State styles
  if (state === 'hover') {
    containerStyle += "scale-[1.02] brightness-105 shadow-[0_0_15px_rgba(172,181,210,0.4)] ";
  } else if (state === 'drag') {
    containerStyle += "opacity-85 scale-105 shadow-[0_10px_25px_rgba(0,0,0,0.5)] ";
  } else {
    // default
    containerStyle += "shadow-[4px_4px_10px_rgba(0,0,0,0.6)] hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_0_15px_rgba(172,181,210,0.4)] ";
  }

  // Type-specific variations
  let bgStyle = "bg-layer-1 bg-gradient-to-br from-layer-2 to-panel border border-slot-active/50 ";
  let innerDepthStyle = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] ";
  let edgeHighlightStyle = "shadow-[inset_1px_1px_0px_rgba(255,255,255,0.1),inset_-1px_-1px_0px_rgba(0,0,0,0.3)] ";
  let textStyle = "text-text-highlight font-bold uppercase text-center drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] ";
  
  let extraContent = null;

  switch (type) {
    case 'CPU':
      innerDepthStyle = "shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] ";
      bgStyle = "bg-layer-1 bg-gradient-to-br from-layer-2 to-panel border border-slot-active ";
      textStyle += "text-[10px] ";
      break;
    case 'RAM':
      bgStyle = "bg-ram-filled bg-gradient-to-br from-ram-filled to-[#B39955] border border-ram-filled/80 ";
      innerDepthStyle = "shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.2)] ";
      textStyle = "text-text-highlight font-bold uppercase text-center rotate-90 whitespace-nowrap drop-shadow-[1px_1px_2px_rgba(0,0,0,0.6)] ";
      break;
    case 'GPU':
      bgStyle = "bg-layer-1 bg-gradient-to-br from-layer-2 to-panel border border-slot-active/60 ";
      innerDepthStyle = "shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] ";
      textStyle += "text-[12px] z-10 ";
      extraContent = (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-4 flex flex-col justify-between opacity-20 pointer-events-none">
          <div className="w-full h-[1px] bg-base shadow-[0_1px_0_rgba(255,255,255,0.2)]"></div>
          <div className="w-full h-[1px] bg-base shadow-[0_1px_0_rgba(255,255,255,0.2)]"></div>
          <div className="w-full h-[1px] bg-base shadow-[0_1px_0_rgba(255,255,255,0.2)]"></div>
        </div>
      );
      break;
    case 'SSD':
      bgStyle = "bg-layer-1 bg-gradient-to-br from-layer-2 to-panel border border-slot-active/40 ";
      innerDepthStyle = "shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_1px_rgba(255,255,255,0.05)] ";
      textStyle += "text-[9px] ";
      break;
    case 'PSU':
      bgStyle = "bg-panel bg-gradient-to-br from-layer-1 to-base border border-slot-active/30 ";
      innerDepthStyle = "shadow-[inset_4px_4px_12px_rgba(0,0,0,0.7),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] ";
      textStyle += "text-[14px] tracking-widest ";
      break;
  }

  return (
    <div className={`${containerStyle} ${bgStyle}`}>
      {/* Inner Depth & Edge Highlight Layers */}
      <div className={`absolute inset-0 rounded-2xl pointer-events-none ${innerDepthStyle}`}></div>
      <div className={`absolute inset-0 rounded-2xl pointer-events-none ${edgeHighlightStyle}`}></div>
      
      {extraContent}

      <span className={`relative z-10 ${textStyle}`}>
        {label}
      </span>

      {onRemoveClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveClick();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-reset-btn border border-cabinet-border/20 flex items-center justify-center text-text-highlight hover:brightness-125 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5),inset_1px_1px_0px_rgba(255,255,255,0.2)] z-20"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
