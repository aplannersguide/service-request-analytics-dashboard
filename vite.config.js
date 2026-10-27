import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative asset paths work seamlessly on GitHub Pages & internal IIS/Nginx servers
  server: {
    host: '127.0.0.1', // Bind strictly to localhost during development
    port: 3000
  }
});
