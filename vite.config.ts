import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Force esbuild to process all typescript/javascript files in the project
    esbuild: {
      loader: 'tsx',
      include: /.*\.[tj]sx?$/,
      exclude: [],
    },
    build: {
      outDir: 'dist',
    },
    // CRITICAL FIX: This injects the environment variables into the browser
    // allowing 'process.env.API_KEY' to work without crashing.
    define: {
      'process.env': JSON.stringify({
         ...env,
         // Ensure the system API key (from Netlify/Container) takes precedence
         API_KEY: process.env.API_KEY || env.API_KEY || ''
      })
    }
  }
})