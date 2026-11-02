/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          accent: '#C8102E',
          deep: '#9E1B32',
        },
        paper: {
          DEFAULT: '#FAF8F5',
          pure: '#FFFFFF',
          subtle: '#F4F1EA',
          border: '#E8E4DC',
          dark: '#18181B',
        },
        charcoal: {
          DEFAULT: '#18181B',
          muted: '#52525B',
          light: '#71717A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif Tamil"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        tamilSerif: ['"Noto Serif Tamil"', 'Georgia', 'serif'],
        tamilSans: ['"Noto Sans Tamil"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'editorial-lg': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'crimson-glow': '0 0 25px rgba(200, 16, 46, 0.25)',
      }
    },
  },
  plugins: [],
};
