import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use explicit cast for process to avoid type errors if @types/node is not fully compatible with the build env
  const env = loadEnv(mode, (process as any).cwd(), '')

  // Helper to encode a value or return an empty string if missing
  const encode = (value: string) => {
    try {
      return btoa(value || '');
    } catch (e) {
      return '';
    }
  };

  // 1. Google API Key (AIza...)
  const rawGoogleKey = env.VITE_GOOGLE_API_KEY || env.API_KEY || '';
  const encodedGoogleKey = encode(rawGoogleKey);

  // 2. Supabase URL and Key
  const rawSupabaseUrl = env.VITE_SUPABASE_URL || '';
  const encodedSupabaseUrl = encode(rawSupabaseUrl);

  const rawSupabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
  const encodedSupabaseKey = encode(rawSupabaseKey);

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Inject runtime decoders. Vite replaces these tokens with the code strings provided.
      // e.g. process.env.API_KEY becomes atob("QUl6...") in the final bundle.
      'process.env.API_KEY': `atob("${encodedGoogleKey}")`,
      'process.env.SUPABASE_URL': `atob("${encodedSupabaseUrl}")`,
      'process.env.SUPABASE_ANON_KEY': `atob("${encodedSupabaseKey}")`,
    }
  }
})