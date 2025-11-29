import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    // Force esbuild to process all typescript/javascript files in the project
    // Using a RegExp is more robust than glob patterns for ensuring files in 'lib/' are transpiled
    esbuild: {
      loader: 'tsx',
      include: /.*\.[tj]sx?$/,
      exclude: [],
    },
    build: {
      outDir: 'dist', // Netlify output directory
    },
    // Fix for "process is not defined" error in browser
    define: {
      'process.env': env
    }
  }
})