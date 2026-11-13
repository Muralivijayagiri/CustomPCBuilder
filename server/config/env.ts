import dotenv from 'dotenv';
dotenv.config();

export const config = {
  hfToken: process.env.HF_TOKEN || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  aiProvider: 'gemini',
  supabaseUrl: process.env.SUPABASE_URL || "https://ebznciwlouycfjtclumg.supabase.co",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViem5jaXdsb3V5Y2ZqdGNsdW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Mzg4ODgsImV4cCI6MjA5MTMxNDg4OH0.oX37mslmGVUEB6P7QL05rp5CxPFCFI3JSFBwbXqjAf4",
  SERP_API_KEY: process.env.SERP_API_KEY as string,
  port: process.env.BACKEND_PORT || 3001,
};
