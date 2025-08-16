import tailwindcss from '@tailwindcss/vite';
import forms from '@tailwindcss/forms';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [tailwindcss(), forms],
};
