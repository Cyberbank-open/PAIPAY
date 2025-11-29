import { createClient } from '@supabase/supabase-js';

// Access the variables defined in vite.config.ts
// Vite will replace these with `atob("encoded_string")` at build time.
// This prevents the raw URL and Key from appearing in the build output as plain text.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Export a flag to check if the client is properly configured
// We verify that the decoded values are present and not empty/dummy
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Key is missing. Check your .env file or Netlify Environment Variables.');
}

// Create a single supabase client for interacting with your database
// We use a safe fallback for the client creation to prevent crash, but operations will fail if keys are invalid.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);