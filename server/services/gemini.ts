import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { contextCheckerPrompt } from '../prompts/contextChecker';
import { recommenderPrompt } from '../prompts/recommender';
import { Message, ComponentRecord, KnowledgeDocument } from '../types';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export async function checkContext(history: Message[], newMessage: string) {
  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  if (newMessage.trim()) {
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: contextCheckerPrompt,
    }
  });

  return response.text || '';
}

export async function streamRecommendation(
  history: Message[],
  newMessage: string,
  components: ComponentRecord[],
  knowledge: KnowledgeDocument[],
  intent: { budget: number, use_case: string, os: string }
) {
  
  const knowledgeSection = knowledge.map((k, i) => `[Chunk ${i+1}]: ${k.content}`).join('\\n\\n');
  const componentsSection = components.map(c => 
    `- ${c.name} (${c.brand} ${c.category}): ₹${c.price} | Specs: ${JSON.stringify(c.specs)}`
  ).join('\\n');

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

  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  if (newMessage.trim()) {
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
  }

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: dynamicSystemInstruction,
    }
  });

  return responseStream;
}
