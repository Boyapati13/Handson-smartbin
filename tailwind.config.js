/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        handson: '#29ABE2',
        navy: {
          900: '#060c18',
          800: '#090f1e',
          700: '#0c1425',
          600: '#101b30',
          500: '#152038',
          400: '#1c2d4a',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"Figtree"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
