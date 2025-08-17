import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import viewTransitions from '@astrojs/transition';

// Astro configuration integrating React and Tailwind
export default defineConfig({
  integrations: [react(), viewTransitions()],
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()]
  }
});
