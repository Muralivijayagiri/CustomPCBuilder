import { PCComponent } from '../types';
import { getDisplaySpecs } from '../utils/specMapper';
import { summarizeSpecs } from '../utils/summarizeSpecs';
import { componentsData } from '../data';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export async function fetchDbComponents(): Promise<PCComponent[]> {
  try {
    const res = await fetch('/api/components');
    if (!res.ok) {
      throw new Error('Failed to fetch components');
    }
    const data = await res.json();
    
    // Transform backend ComponentRecord to frontend PCComponent mapping
    return data.map((c: any) => {
      const parsedSummary = summarizeSpecs(c.category, c.specs, c.name);
      const fallbackSummary =
        typeof c.specs === 'string'
          ? c.specs
          : c.specs?.summary || '';

      return {
        id: c.id,
        type: c.category.toUpperCase(),
        brand: c.brand,
        name: c.name,
        specs: c.specs ? JSON.stringify(c.specs).replace(/["{}]/g, '').replace(/:/g, ': ') : '',
        displaySpecs: getDisplaySpecs(c.category, c.specs, c.name),
        summary: parsedSummary || fallbackSummary,
        price: c.price,
        image_url: c.image_url,
        buy_link: c.buy_link
      };
    });
  } catch (err) {
    console.warn('Falling back to local componentsData:', err);
    return componentsData.map((c) => ({
      ...c,
      displaySpecs: c.displaySpecs?.length ? c.displaySpecs : getDisplaySpecs(c.type, {}, c.name),
      summary: c.summary || summarizeSpecs(c.type, {}, c.name) || c.specs
    }));
  }
}

export async function refreshCategory(category: string) {
  const res = await fetch('/api/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ category })
  });

  if (!res.ok) {
    let errorText = await res.text();
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) errorText = parsed.message;
    } catch (e) {
      // Not JSON, use raw text
    }
    throw new Error(errorText || 'Failed to refresh category');
  }

  return res.json();
}

export async function streamChat(
  message: string,
  history: Message[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      onError(errorText);
      return;
    }

    if (!res.body) {
      onError('No response body');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onToken(chunk);
      }
    }

    onDone();
  } catch (error: any) {
    onError(error.message || 'Stream failed');
  }
}
