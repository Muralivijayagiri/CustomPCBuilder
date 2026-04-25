import dotenv from 'dotenv';
dotenv.config();

export const config = {
  hfToken: process.env.HUGGINGFACEHUB_API_TOKEN as string,
  aiProvider: process.env.AI_PROVIDER || 'huggingface',
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  SERP_API_KEY: process.env.SERP_API_KEY as string,
  port: process.env.BACKEND_PORT || 3001,
};
