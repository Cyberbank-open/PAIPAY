import { createClient } from '@supabase/supabase-js';

// Access environment variables using type casting to avoid TS errors during build
// We remove any trailing slash from the URL to prevent double-slash errors in requests
const getEnvVar = (key: string, fallback: string) => {
  try {
    return (import.meta as any).env[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseUrl = rawUrl ? rawUrl.replace(/\/$/, '') : '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

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
  console.warn("Supabase Client Initialization: Environment variables missing. Using placeholder client.");
  // Fallback dummy client to allow app to render error UI instead of white screen
  // This prevents the entire JS bundle from failing to execute
  client = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = client;