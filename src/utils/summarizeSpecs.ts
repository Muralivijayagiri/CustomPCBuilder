import { getDisplaySpecs } from './specMapper';

export function summarizeSpecs(category: string, specs: any, name: string = ''): string {
  const displaySpecs = getDisplaySpecs(category, specs, name);
  
  if (!displaySpecs || displaySpecs.length === 0) {
    return '';
  }

  const values = displaySpecs.map(s => s.value);
  
  // Custom formatting based on category to match PCPartPicker style
  const cat = category.toUpperCase();
  let summary: string[] = [];

  switch (cat) {
    case 'CPU': {
      const cores = displaySpecs.find(s => s.label === 'Cores')?.value;
      const threads = displaySpecs.find(s => s.label === 'Threads')?.value;
      const coreThreadStr = (cores && threads) ? `${cores.replace(/\s+/g, '')}/${threads.replace(/\s+/g, '')}` : cores;
      if (coreThreadStr) summary.push(coreThreadStr);
      
      const clock = displaySpecs.find(s => s.label === 'Clock')?.value;
      if (clock) summary.push(clock);
      
      // Fallback
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'GPU': {
      const vram = displaySpecs.find(s => s.label === 'VRAM')?.value;
      if (vram) summary.push(vram);
      
      const clock = displaySpecs.find(s => s.label === 'Clock')?.value;
      if (clock) summary.push(clock);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'RAM': {
      const cap = displaySpecs.find(s => s.label === 'Capacity')?.value;
      if (cap) summary.push(cap);
      
      const type = displaySpecs.find(s => s.label === 'DDR Type')?.value;
      if (type) summary.push(type);
      
      const speed = displaySpecs.find(s => s.label === 'Speed')?.value;
      if (speed) summary.push(speed);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'MOTHERBOARD': {
      const socket = displaySpecs.find(s => s.label === 'Socket')?.value;
      if (socket) summary.push(socket);
      
      const chipset = displaySpecs.find(s => s.label === 'Chipset')?.value;
      if (chipset) summary.push(chipset);
      
      const ramType = displaySpecs.find(s => s.label === 'RAM Type')?.value;
      if (ramType) summary.push(ramType);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'SSD': {
      const cap = displaySpecs.find(s => s.label === 'Capacity')?.value;
      if (cap) summary.push(cap);
      
      const iface = displaySpecs.find(s => s.label === 'Gen/Int')?.value;
      if (iface) summary.push(iface);
      
      const type = displaySpecs.find(s => s.label === 'Type')?.value;
      if (type) summary.push(type);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'PSU': {
      const watts = displaySpecs.find(s => s.label === 'Wattage')?.value;
      if (watts) summary.push(watts);
      
      const eff = displaySpecs.find(s => s.label === 'Efficiency')?.value;
      if (eff) summary.push(`80+ ${eff}`);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    case 'CABINET': {
      const mobo = displaySpecs.find(s => s.label === 'Mobo Support')?.value;
      if (mobo) summary.push(mobo);
      
      const glassMatch = name.match(/(Tempered Glass)/i);
      if (glassMatch) summary.push(glassMatch[1]);
      
      if (summary.length < 2) summary = values.slice(0, 3);
      break;
    }
    default:
      summary = values.slice(0, 3);
  }

  // Remove duplicates and limit to 3 items
  return Array.from(new Set(summary.filter(Boolean))).slice(0, 3).join(' • ');
}
