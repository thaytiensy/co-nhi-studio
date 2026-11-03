/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        art: {
          50: '#fff9eb',
          100: '#ffefc6',
          200: '#fedd88',
          300: '#fec74a',
          400: '#fdb01d',
          500: '#f5930b',
          600: '#d97106',
          700: '#b45009',
          800: '#923e0e',
          900: '#78330f',
        },
        studio: {
          bg: '#f8fafc',
          card: '#ffffff',
          sidebar: '#f1f5f9',
          accent: '#4f46e5',
          teal: '#0d9488',
          pink: '#e11d48',
          purple: '#9333ea',
        }
      },
      fontFamily: {
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
