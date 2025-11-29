import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, raw browser, etc.)
const getEnvVar = (key: string): string | undefined => {
  // Try import.meta.env (Vite standard)
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignore error
  }
  
  // Try process.env (Standard Node/Polyfill)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Export a flag to check if the client is properly configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'undefined';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Key is missing. Check your .env file or Netlify Environment Variables.');
}

// Create a single supabase client for interacting with your database
// If config is missing, we pass a dummy URL to prevent the createClient function from throwing an immediate error.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);