import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', '@use-gesture/react', 'framer-motion', 'react-spring']
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  build: {
    outDir: 'dist',
    // Ensure source maps for better debugging in Capacitor
    sourcemap: true,
  }
});
