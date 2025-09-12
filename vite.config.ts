import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ Cambia esto de './' a '/'
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // ✅ Elimina manualChunks o simplifícalo
        manualChunks: undefined,
      },
    },
  },
});