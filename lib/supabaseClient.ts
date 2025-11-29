import { createClient } from '@supabase/supabase-js';

// Access environment variables directly via Vite's import.meta.env
// Cast import.meta to any to avoid type errors when vite types are missing in environment
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Export a flag to check if the client is properly configured
// Checks if variables are present and not equal to placeholder defaults if any
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co';

// Create the Supabase client
// We initialize with values or empty strings.
// The app checks `isSupabaseConfigured` before attempting to use auth/db features.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);