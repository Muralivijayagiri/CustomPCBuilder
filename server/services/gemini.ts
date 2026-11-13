import { GoogleGenAI } from '@google/genai';
import { HfInference } from '@huggingface/inference';
import { config } from '../config/env';
import { contextCheckerPrompt } from '../prompts/contextChecker';
import { recommenderPrompt } from '../prompts/recommender';
import { Message, ComponentRecord, KnowledgeDocument } from '../types';
import { getShortName } from '../../src/utils/specMapper';

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY });
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

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 800): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || '');
      const status = err?.status || err?.code;
      const isTransient = status === 503 || status === 429 || msg.includes('503') || msg.includes('UNAVAILABLE');
      if (!isTransient || i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

export async function checkContext(history: Message[], newMessage: string) {
  const systemInstruction = contextCheckerPrompt + '\n\nIMPORTANT: If the context is complete you MUST ONLY return "CONTEXT_COMPLETE:{...}" without ANY backticks, conversational fluff, or markdown wrapping.';
  
  if (config.aiProvider === 'gemini') {
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    if (newMessage.trim()) {
      contents.push({ role: 'user', parts: [{ text: newMessage }] });
    }

    const response = await withRetry(() => getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
      }
    }));

    return response.text || '';
  } else {
    // HuggingFace
    const messages: any[] = [
      { role: 'system', content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];
    if (newMessage.trim()) {
      messages.push({ role: 'user', content: newMessage });
    }

    try {
      const response = await getHf().chatCompletion({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      const detailedMsg = err.httpResponse?.body?.error?.message || err.httpResponse?.body?.error || err.message;
      throw new Error(detailedMsg);
    }
  }
}

export async function streamRecommendation(
  history: Message[],
  newMessage: string,
  components: ComponentRecord[],
  knowledge: KnowledgeDocument[],
  intent: { budget: number, use_case: string, os: string }
) {
  
  const knowledgeSection = knowledge.map((k, i) => `[Chunk ${i+1}]: ${k.content}`).join('\n\n');
  const componentsSection = components.map(c => {
    // Only extract necessary fields for the LLM, avoid huge texts
    let conciseSpecs: any = {};
    if (c.specs && typeof c.specs === 'object') {
       // Just grab standard specs or top level string values that are under 100 characters to keep it short
       for (const [key, val] of Object.entries(c.specs)) {
          if (typeof val === 'string' && val.length < 100) conciseSpecs[key] = val;
          else if (typeof val === 'number') conciseSpecs[key] = val;
          else if (Array.isArray(val) && val.length < 5) conciseSpecs[key] = val.slice(0, 3);
          else if (typeof val === 'object' && val !== null) {
              if (key === 'item_specifications' || key === 'product_details') {
                 // Try extracting only known concise specs
                 for (const [k, v] of Object.entries(val)) {
                    if (typeof v === 'string' && v.length < 100) conciseSpecs[k] = v;
                 }
              }
          }
       }
       // remove 'about_item' and huge marketing text
       delete conciseSpecs['about_item'];
       delete conciseSpecs['about_this_item'];
       delete conciseSpecs['product_description'];
       delete conciseSpecs['brand']; // duplicate
    } else {
       conciseSpecs = c.specs;
    }

    return `- ${c.category} | ${c.brand} | ${c.name} | ₹${c.price} | Specs: ${JSON.stringify(conciseSpecs)}`;
  }).join('\n');

  const dynamicSystemInstruction = `${recommenderPrompt}

--- KNOWLEDGE BASE ---
${knowledgeSection}

--- AVAILABLE COMPONENTS ---
${componentsSection}

--- USER INTENT ---
Budget: ₹${intent.budget}
Use Case: ${intent.use_case}
OS: ${intent.os}
`;

  if (config.aiProvider === 'gemini') {
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    if (newMessage.trim()) {
      contents.push({ role: 'user', parts: [{ text: newMessage }] });
    }

    const responseStream = await withRetry(() => getAi().models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
      }
    }));

    async function* wrappedStream() {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    }

    return wrappedStream();
  } else {
    // HuggingFace
    const messages: any[] = [
      { role: 'system', content: dynamicSystemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];
    
    if (newMessage.trim()) {
      messages.push({ role: 'user', content: newMessage });
    }

    try {
      const hfStream = getHf().chatCompletionStream({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages,
        max_tokens: 4000,
      });

      async function* wrappedStream() {
        try {
          for await (const chunk of hfStream) {
            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              yield { text: chunk.choices[0].delta.content };
            }
          }
        } catch (streamErr: any) {
          const msg = streamErr.httpResponse?.body?.error?.message || streamErr.httpResponse?.body?.error || streamErr.message;
          throw new Error(msg);
        }
      }
      
      return wrappedStream();
    } catch (err: any) {
      const detailed = err.httpResponse?.body?.error?.message || err.httpResponse?.body?.error || err.message;
      throw new Error(detailed);
    }
  }
}
