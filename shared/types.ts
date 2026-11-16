export type ComponentCategory =
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'SSD'
  | 'PSU'
  | 'MOTHERBOARD'
  | 'CABINET';

export type ComponentType = ComponentCategory;

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface UserIntent {
  budget: number;
  use_case: string;
  os: string;
}

export interface ComponentRecord {
  id: string;
  name: string;
  category: ComponentCategory;
  brand: string | null;
  price: number;
  specs: any;
  buy_link: string | null;
  image_url?: string | null;
  source?: string | null;
}

export interface KnowledgeDocument {
  content: string;
  metadata: any;
}

export interface PCComponent {
  id: string | number;
  type: ComponentType;
  brand: string;
  name: string;
  specs: string;
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
