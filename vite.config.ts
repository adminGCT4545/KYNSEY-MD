import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'date-utils': ['date-fns'],
          'ui-utils': ['lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable JSX in .ts files
      loader: {
        '.ts': 'tsx',
        '.js': 'jsx',
      }
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom', 
      'date-fns',
      'lodash',
      'react-dnd',
      'react-dnd-html5-backend'
    ],
    exclude: []
  },
  plugins: [
    react({
      // Ensure all JSX/TSX files are properly processed
      include: '**/*.{jsx,tsx,ts,js}',
    }),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
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
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8888')
    },
  },
  resolve: {
    // Explicitly list extensions to ensure proper resolution
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@medical': path.resolve(__dirname, './src/components/medical'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@models': path.resolve(__dirname, './backend/models'),
      '@routes': path.resolve(__dirname, './backend/routes'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 5177,
    strictPort: false,
    host: 'localhost',
    hmr: {
      timeout: 30000 // Increase HMR timeout to 30 seconds
    },
    watch: {
      usePolling: true,
      interval: 1000
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false
      }
    },
    cors: true,
    // Force proper MIME types for TypeScript files
    fs: {
      strict: false,
      allow: ['..']
    },
    middlewareMode: false
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
