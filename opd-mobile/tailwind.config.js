/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#5B7CF5',
          500: '#2A55E0',
          600: '#123FBF',
          700: '#0D2F9E',
          800: '#0A2478',
        },
        aqua: {
          100: '#D7FBF5',
          200: '#A9F5EA',
          300: '#6EEFE0',
          500: '#14B8A6',
          700: '#0F766E',
          900: '#0F5B54',
        },
        danger: '#C31A1A',
        ink: '#0F172A',
        canvas: '#F1F5F9',
      },
      fontFamily: {
        sans: ['Figtree', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 10px 30px -10px rgba(18,63,191,.45)',
      },
      keyframes: {
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '.55' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bar: { '0%': { width: '0%' }, '100%': { width: '100%' } },
        wave: {
          '0%,100%': { transform: 'scaleY(.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        ping2: 'ping2 1.8s cubic-bezier(0,0,.2,1) infinite',
        rise: 'rise .28s ease-out both',
        bar: 'bar 2.6s linear forwards',
        wave: 'wave 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
