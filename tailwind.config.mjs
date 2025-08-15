// Tailwind CSS configuration defining custom colors, fonts and plugins
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5224af',
          400: '#a57cf0',
          700: '#5224af',
        },
        success: '#8cc63f',
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  // Enable form styling utilities
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
