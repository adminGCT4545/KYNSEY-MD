import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill specific modules
      include: [
        'fs',
        'path',
        'os',
        'crypto',
        'events',
        'stream',
        'util',
        'assert'
      ]
    }),
  ],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
  server: {
    hmr: {
      overlay: false, // Disable the error overlay
    },
    port: 5177, // Change port to match the one in the test URLs
  },
})
