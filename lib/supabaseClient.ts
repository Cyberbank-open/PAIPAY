import { createClient } from '@supabase/supabase-js';

// User provided credentials fallback
// NOTE: Ideally these should be in .env files, but hardcoded here to fix deployment immediately.
const PROVIDED_URL = 'https://bctjfhjvtajwzdgujqlh.supabase.co';
const PROVIDED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdGpmaGp2dGFqd3pkZ3VqcWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDEzNjIsImV4cCI6MjA3OTk3NzM2Mn0.VkDpjYr6vky540Jp5D1R1_OXqHpXKJ7EcjeEZqynl4Y';

// Access environment variables using type casting to avoid TS errors during build
// We remove any trailing slash from the URL to prevent double-slash errors in requests
const getEnvVar = (key: string, fallback: string) => {
  try {
    return (import.meta as any).env[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL', PROVIDED_URL);
const supabaseUrl = rawUrl ? rawUrl.replace(/\/$/, '') : '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', PROVIDED_KEY);

// Export a flag to check if the client is properly configured
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co';

// Create a single supabase client for interacting with your database
// Using a try-catch block for the client creation to prevent top-level app crashes (White Screen)
let client: any;
try {
  // Basic validation to prevent immediate crash if values are empty
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Key");
  }
  
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("Supabase Client Initialization Failed:", error);
  // Fallback dummy client to allow app to render error UI instead of white screen
  // This prevents the entire JS bundle from failing to execute
  client = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = client;