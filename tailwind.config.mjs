/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Aquí definimos los colores de tu maqueta
        'primary': {
          DEFAULT: '#6D28D9', // Morado principal
          '50': '#F5F3FF',
          '100': '#EDE9FE',
          '200': '#DDD6FE',
          '300': '#C4B5FD',
          '400': '#A78BFA',
          '500': '#8B5CF6',
          '600': '#7C3AED',
          '700': '#6D28D9', // El mismo que DEFAULT
          '800': '#5B21B6',
          '900': '#4C1D95',
        },
      },
      fontFamily: {
        // Si usas una fuente específica, la añadiríamos aquí.
        // Por ahora, usaremos las fuentes por defecto de Tailwind.
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin para dar estilos básicos a los formularios
  ],
}