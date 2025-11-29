import { createClient } from '@supabase/supabase-js';

// Safe environment variable access to prevent white-screen crashes if env is undefined
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Export a flag to check if the client is properly configured
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co';

// Create the Supabase client with a fallback to prevent initialization errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);