/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070A0F',
          900: '#090D16',
          800: '#0F172A',
          700: '#1E293B',
        },
        tactical: {
          emerald: '#10B981',
          amber: '#F59E0B',
          orange: '#F97316',
          crimson: '#EF4444',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
