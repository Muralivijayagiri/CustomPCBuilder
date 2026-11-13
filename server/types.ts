export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface ComponentRecord {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  specs: any;
  buy_link: string | null;
}

export interface KnowledgeDocument {
  content: string;
  metadata: any;
}

