import dotenv from 'dotenv';
dotenv.config();

export type AIProvider = 'gemini' | 'huggingface';

export function resolveAIProvider(value: string | undefined = process.env.AI_PROVIDER): AIProvider {
  return value?.trim().toLowerCase() === 'huggingface' ? 'huggingface' : 'gemini';
}

export const config = {
  hfToken: process.env.HF_TOKEN || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  aiProvider: resolveAIProvider(),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  serpApiKey: process.env.SERP_API_KEY || "",
  port: Number(process.env.PORT) || 3000,
};
