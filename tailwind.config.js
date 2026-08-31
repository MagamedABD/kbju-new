/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#fbfbf9',
        card: '#ffffff',
        ink: '#1c1c1a',
        muted: '#8a8a82',
        line: '#ecebe6',
        brand: '#3f7d5a',
        'brand-soft': '#e8f1ea',
        macroP: '#3f7d5a',
        macroF: '#c8a24a',
        macroC: '#5a7fb0',
        warn: '#c2622d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
