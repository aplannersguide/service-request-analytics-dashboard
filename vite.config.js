import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative asset paths work seamlessly on GitHub Pages
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
