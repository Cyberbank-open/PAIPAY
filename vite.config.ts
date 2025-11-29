import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Force esbuild to process all typescript files in the project
    // This fixes the issue where files in 'lib/' are not transpiled by Rollup
    esbuild: {
      loader: 'tsx',
      include: /.*\.[tj]sx?$/,
      exclude: [],
    },
    build: {
      outDir: 'dist', // Netlify output directory
    },
    define: {
      // Map the Netlify environment variable (VITE_GOOGLE_API_KEY) to the one expected by the SDK (process.env.API_KEY)
      // This ensures the AI features work in the browser.
      'process.env.API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY || env.API_KEY),
    }
  }
})