export function classifyCategory(title: string, keyword: string): string {
  const checkHit = (str: string, words: string[]) => {
    const lower = str.toLowerCase();
    return words.some(w => lower.includes(w));
  };

  const rules = [
    { cat: 'CPU', words: ['cpu', 'processor', 'ryzen', 'core i'] },
    { cat: 'GPU', words: ['gpu', 'graphics', 'rtx', 'rx', 'radeon', 'geforce'] },
    { cat: 'RAM', words: ['ram', 'memory', 'ddr'] },
    { cat: 'SSD', words: ['ssd', 'solid state drive', 'nvme', 'sata'] },
    { cat: 'Motherboard', words: ['motherboard'] },
    { cat: 'PSU', words: ['psu', 'power supply'] },
    { cat: 'Cabinet', words: ['case', 'cabinet', 'tower', 'chassis'] }
  ];

  // Primary signal: keyword
  for (const rule of rules) {
    if (checkHit(keyword, rule.words)) return rule.cat;
  }

  // Secondary signal: title
  for (const rule of rules) {
    if (checkHit(title, rule.words)) return rule.cat;
  }

  return 'Unknown';
}
