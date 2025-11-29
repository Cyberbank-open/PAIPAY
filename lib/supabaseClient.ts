import { createClient } from '@supabase/supabase-js';

// NOTE: These are placeholder variables.
// In a real scenario, you would create a project at https://supabase.com
// and replace these with your actual Project URL and Anon Key.
// You should store these in a .env file (import.meta.env.VITE_SUPABASE_URL)

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);