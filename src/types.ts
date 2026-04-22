export type ComponentType = 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'PSU' | 'MOTHERBOARD' | 'CABINET';

export interface PCComponent {
  id: number;
  type: ComponentType;
  brand: string;
  name: string;
  specs: string;
  price: number;
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
