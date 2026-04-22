import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

for (const envVar of requiredVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY as string,
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  port: 3001,
};
