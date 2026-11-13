export type ComponentType = 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'PSU' | 'MOTHERBOARD' | 'CABINET';

export interface PCComponent {
  id: number;
  type: ComponentType;
  brand: string;
  name: string;
  specs: string; // the raw JSON string or empty
  displaySpecs: { label: string; value: string }[];
  summary?: string;
  price: number;
  image_url?: string;
  buy_link?: string;
}

export interface BuildState {
  CABINET: PCComponent | null;
  MOTHERBOARD: PCComponent | null;
  CPU: PCComponent | null;
  GPU: PCComponent | null;
  SSD: PCComponent | null;
  PSU: PCComponent | null;
  RAM: (PCComponent | null)[];
}
