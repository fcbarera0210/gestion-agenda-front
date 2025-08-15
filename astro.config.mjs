import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// Astro configuration integrating React and Tailwind
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
