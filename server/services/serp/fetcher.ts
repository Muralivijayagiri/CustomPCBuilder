import { config } from '../../config/env';
import { GoogleGenAI } from '@google/genai';
import { HfInference } from '@huggingface/inference';

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

let hfClient: HfInference | null = null;
function getHf() {
  if (!config.hfToken) {
    throw new Error("HUGGINGFACEHUB_API_TOKEN is missing or invalid. Please add it to the environment variables.");
  }
  if (!hfClient) {
    hfClient = new HfInference(config.hfToken);
  }
  return hfClient;
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function searchProducts(keyword: string) {
  let useFallback = false;
  if (!config.SERP_API_KEY) {
    useFallback = true;
  }
  
  if (!useFallback) {
    try {
      const url = `https://serpapi.com/search?engine=amazon&amazon_domain=amazon.in&k=${encodeURIComponent(keyword)}&api_key=${config.SERP_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.organic_results || [];
      }
      if (res.status === 429) {
        console.warn('SerpAPI rate limit reached, falling back to AI generation for:', keyword);
        useFallback = true;
      } else {
        throw new Error(`SerpAPI search failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.warn('Error fetching search products, falling back to AI:', error.message);
      useFallback = true;
    }
  }

  if (useFallback) {
    try {
      const prompt = `Generate a JSON array of 10 popular PC components matching the keyword "${keyword}" available on Amazon with fields: title (string), brand (string), price (object with value pointing to INR number, e.g. {"value": 15000}), thumbnail (string URL), link (string URL). Return ONLY valid JSON array.`;
      
      let content = '[]';
      if (config.aiProvider === 'gemini') {
        const aiRes = await getAi().models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        content = aiRes.text || '[]';
      } else {
        const aiRes = await getHf().chatCompletion({
          model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500
        });
        content = aiRes.choices[0].message.content || '[]';
      }

      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']') + 1;
      let items = [];
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = content.substring(jsonStart, jsonEnd);
        try {
          items = JSON.parse(jsonString);
        } catch (e) {
          console.error("Failed to parse JSON array from AI:", e, "Content:", content);
        }
      }
      return items.map((item: any) => ({
        ...item,
        extracted_price: item.price?.value || item.price || 5000
      }));
    } catch (err) {
      console.error('Fallback generation failed:', err);
      return [];
    }
  }
}

export async function getProductDetail(asin: string, fallbackPrice: number, category: string) {
  if (!config.SERP_API_KEY) {
    throw new Error('SERP_API_KEY is not configured in the environment.');
  }
  try {
    const url = `https://serpapi.com/search?engine=amazon_product&amazon_domain=amazon.in&asin=${encodeURIComponent(asin)}&api_key=${config.SERP_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`SerpAPI detail failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error('Error fetching product detail:', error);
    throw error;
  }
}
