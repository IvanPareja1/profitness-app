import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';


export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['react-i18next', 'i18next'],
        },
      },
    },
  },
  // ✅ Configuración correcta para SPA en Vite
  server: {
    // Vite maneja las rutas automáticamente en desarrollo
  },
  // ✅ Opcional: Configuración para el preview (producción)
  preview: {
    port: 5173,
    strictPort: true,
  }
});