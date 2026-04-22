import { ComponentType } from './types';

/**
 * TRACES SYSTEM ARCHITECTURE
 * 
 * Purpose:
 * This system defines the logical connections (circuit traces) between different PC components.
 * It maps out how data (green) and power (gold) flow through the system.
 * 
 * Motherboard Control:
 * The motherboard acts as the central hub and physical medium for the traces.
 * Traces should only be considered "active" or rendered if `isMotherboardInstalled` is true.
 * Without the motherboard, the physical pathways for these connections do not exist.
 */

export type TraceType = 'data' | 'power';

export interface TraceConnection {
  from: ComponentType;
  to: ComponentType | ComponentType[];
  type: TraceType;
  // Placeholder for future SVG path routing coordinates or logic
  routing: string; 
}

export const TRACE_MAP: Record<string, TraceConnection> = {
  cpuToRam: { 
    from: 'CPU', 
    to: 'RAM', 
    type: 'data',
    routing: 'M 180 120 L 220 120 L 240 100 L 350 100' 
  },
  cpuToGpu: { 
    from: 'CPU', 
    to: 'GPU', 
    type: 'data',
    routing: 'M 120 180 L 120 220 L 140 240 L 140 320 L 160 340 L 250 340' 
  },
  cpuToSsd: { 
    from: 'CPU', 
    to: 'SSD', 
    type: 'data',
    routing: 'M 100 180 L 100 240 L 120 260 L 150 260' 
  },
  psuToAll: { 
    from: 'PSU', 
    to: ['CPU', 'GPU', 'SSD', 'RAM', 'MOTHERBOARD'], 
    type: 'power',
    routing: 'M 450 650 L 450 600 L 400 550 L 150 550 L 100 500' 
  }
};
