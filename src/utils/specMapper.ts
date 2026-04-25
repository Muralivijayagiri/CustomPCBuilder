export function getShortName(name: string): string {
  if (!name) return '';
  let cleanName = name.replace(/^visit the[ \w]+store\s*-?/i, '').trim();
  cleanName = cleanName.replace(/^brand:\s*\w+\s*-?/i, '').trim();

  // Split by |, (, or multiple spaces/newlines, but NOT by dashes as models use them.
  let short = cleanName.split(/\||\(|,(?=\s)| - /)[0].trim();
  
  if (short.length > 50) {
    short = short.substring(0, 50).trim() + '...';
  }
  return short || cleanName;
}

export function getDisplaySpecs(category: string, specs: any, name: string = ''): { label: string; value: string }[] {
  if (!specs || typeof specs !== 'object') specs = {};

  const findValue = (aliases: string[]): string | null => {
    const searchKeys = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null;
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (aliases.some(alias => lowerKey.includes(alias.toLowerCase()))) {
          return String(value);
        }
        if (typeof value === 'object') {
          const nested = searchKeys(value);
          if (nested) return nested;
        }
      }
      return null;
    };

    const val = searchKeys(specs);
    if (!val) return null;
    return val;
  };

  const cat = category.toUpperCase();
  const result: { label: string; value: string }[] = [];

  const add = (label: string, val: string | null, suffix: string = '') => {
    if (val && val !== '-' && val !== 'null' && val.toLowerCase() !== 'unknown') {
      const lowerVal = val.toLowerCase();
      const finalVal = (suffix && !lowerVal.includes(suffix.toLowerCase().trim())) 
        ? `${val} ${suffix}`.trim() 
        : val;
      result.push({ label, value: finalVal });
    }
  };

  // Extract from name if missing from specs:
  const extractFromName = (regex: RegExp): string | null => {
    if (!name) return null;
    const match = name.match(regex);
    return match ? match[1] || match[0] : null;
  };

  switch (cat) {
    case 'MOTHERBOARD':
      add('Socket', findValue(['socket', 'cpu socket']) || extractFromName(/(LGA\s?\d+|AM[45]|TR4|sTRX4)/i));
      add('Chipset', findValue(['chipset']) || extractFromName(/\b([A-Z]\d{2,}M?)\b/i));
      add('RAM Type', findValue(['memory technology', 'ram type']) || extractFromName(/(DDR[345])/i));
      add('Form Factor', findValue(['form factor']) || extractFromName(/(ATX|Micro-?ATX|Mini-?ITX|E-?ATX)/i));
      break;
    case 'CPU':
      add('Cores', findValue(['cores', 'processor count']) || extractFromName(/(\d+)\s*-?cores?/i), 'Cores');
      add('Clock', findValue(['boost clock', 'max turbo', 'clock speed', 'base clock', 'processor speed']) || extractFromName(/(\d\.\d+)\s*GHz/i), 'GHz');
      add('Threads', findValue(['threads']) || extractFromName(/(\d+)\s*-?threads?/i), 'Threads');
      add('TDP', findValue(['tdp', 'wattage', 'power', 'power consumption']), 'W');
      break;
    case 'RAM':
      add('Capacity', findValue(['capacity', 'ram size', 'memory size', 'size']) || extractFromName(/(\w*\d+)\s*(?:GB|TB)/i), 'GB');
      add('Speed', findValue(['memory speed', 'speed', 'clock']) || extractFromName(/(\d{3,4})\s*(?:MHz|MT\/s)/i), 'MHz');
      add('DDR Type', findValue(['memory technology', 'type', 'ram type']) || extractFromName(/(DDR[345])/i));
      add('Config', findValue(['module', 'stick', 'kit']));
      break;
    case 'SSD':
      add('Capacity', findValue(['capacity', 'digital storage capacity', 'size']) || extractFromName(/(\d+\s*(?:GB|TB))/i));
      add('Gen/Int', findValue(['hardware interface', 'interface', 'generation']) || extractFromName(/(Gen\s?\d|NVMe|SATA|PCIe\s?\d)/i));
      add('Read Speed', findValue(['read speed']));
      add('Type', findValue(['form factor', 'disk type']) || extractFromName(/(M\.2|2\.5[ \-]?inch|SSD)/i));
      break;
    case 'GPU':
      add('VRAM', findValue(['graphics ram', 'vram', 'video memory', 'ram size']) || extractFromName(/(\d+)\s*GB/i), 'GB');
      add('Clock', findValue(['clock speed', 'boost clock', 'gpu clock speed']));
      add('Power', findValue(['wattage', 'power consumption']), 'W');
      add('Outputs', findValue(['video output', 'outputs', 'display']));
      break;
    case 'PSU':
      add('Wattage', findValue(['wattage', 'power output', 'watts', 'power']) || extractFromName(/(\d{3,4})\s*W/i), 'W');
      add('Efficiency', findValue(['efficiency', '80 plus']) || (name.match(/80 Plus|80\+/i) ? name.match(/80(?:\s*Plus|\+)\s*(Gold|Titanium|Platinum|Bronze|Silver|White)/i)?.[1] || 'Standard' : null));
      add('Modularity', findValue(['modular', 'modularity']) || extractFromName(/(Fully Modular|Semi Modular|Non Modular)/i));
      add('Form Factor', findValue(['form factor']) || extractFromName(/(ATX|SFX|SFX-L)/i));
      break;
    case 'CABINET':
      add('Mobo Support', findValue(['motherboard compat', 'motherboard support', 'form factor']));
      add('Fans', findValue(['fans', 'cooling method']));
      add('Radiator', findValue(['radiator']));
      add('GPU Clearance', findValue(['gpu clearance', 'vga length', 'max gpu']));
      break;
    default:
      break;
  }

  return result;
}
