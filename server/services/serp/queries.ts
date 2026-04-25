export function getKeywordsForCategory(category: string): string[] {
  switch (category) {
    case 'CPU':
      return ["desktop CPU", "AM5 CPU", "AM4 CPU", "LGA1700 CPU", "Ryzen 5 CPU", "Ryzen 7 CPU", "Ryzen 9 CPU", "Core i5 CPU", "Core i7 CPU", "Core i9 CPU"];
    case 'GPU':
      return ["graphics card", "RTX 4060", "RTX 4070", "RTX 4080", "RX 7600", "RX 7700", "RX 7800 XT", "gaming GPU"];
    case 'RAM':
      return ["DDR4 RAM", "DDR5 RAM", "16GB RAM", "32GB RAM", "DDR4 3200 RAM", "DDR5 6000 RAM"];
    case 'Motherboard':
      return ["AM5 motherboard", "AM4 motherboard", "LGA1700 motherboard", "B650 motherboard", "B550 motherboard", "X670 motherboard"];
    case 'PSU':
      return ["550W PSU", "650W PSU", "750W PSU", "850W PSU", "fully modular PSU", "80 plus gold PSU"];
    case 'SSD':
      return ["1TB NVMe SSD", "2TB NVMe SSD", "500GB NVMe SSD", "1TB SATA SSD", "Gen4 NVMe SSD", "Gen3 NVMe SSD"];
    case 'Cabinet':
      return ["ATX case", "mATX case", "mini tower case", "gaming PC case", "mid tower cabinet"];
    default:
      return [];
  }
}
