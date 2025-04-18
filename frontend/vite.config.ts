import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: true
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
