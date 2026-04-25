import { GoogleGenAI } from '@google/genai';
import { HfInference } from '@huggingface/inference';
import { config } from '../config/env';
import { contextCheckerPrompt } from '../prompts/contextChecker';
import { recommenderPrompt } from '../prompts/recommender';
import { Message, ComponentRecord, KnowledgeDocument } from '../types';

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

    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

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

    const response = await getHf().chatCompletion({
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      messages,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
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
  const componentsSection = components.map(c => 
    `- ${c.name} (${c.brand} ${c.category}): ₹${c.price} | Specs: ${JSON.stringify(c.specs)}`
  ).join('\n');

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

    const responseStream = await getAi().models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
      }
    });

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

    const hfStream = getHf().chatCompletionStream({
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      messages,
      max_tokens: 4000,
    });

    async function* wrappedStream() {
      for await (const chunk of hfStream) {
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          yield { text: chunk.choices[0].delta.content };
        }
      }
    }
    
    return wrappedStream();
  }
}
