/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#F7F8F6',
          card: '#FFFFFF',
          border: '#E7EBE7',
          'border-subtle': '#F0F3F0',
          text: '#252A27',
          muted: '#727A74',
          subtle: '#9DA5A0',
          primary: '#173D30',
          'primary-hover': '#112F25',
          secondary: '#237653',
          'secondary-light': '#EBF5F0',
          gold: '#C5A16E',
          'gold-light': '#FAF6F0',
          'gold-dark': '#9E7F50',
          danger: '#DC2626',
          'danger-light': '#FEF2F2',
          warning: '#D97706',
          'warning-light': '#FFFBEB',
          info: '#2563EB',
          'info-light': '#EFF6FF',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F4ECE0',
        },
        forest: {
          50: '#EAF3EF',
          100: '#D5E6DF',
          600: '#237653',
          700: '#173D30',
          800: '#103928',
          900: '#0B261B',
          950: '#071A12',
        },
        gold: {
          50: '#FAF6F0',
          100: '#F3EAD9',
          500: '#C5A16E',
          600: '#9E7F50',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 1px 3px 0 rgba(23, 61, 48, 0.05), 0 1px 2px -1px rgba(23, 61, 48, 0.03)',
        'luxury-md': '0 4px 12px -2px rgba(23, 61, 48, 0.06), 0 2px 6px -2px rgba(23, 61, 48, 0.04)',
        'luxury-lg': '0 12px 24px -4px rgba(23, 61, 48, 0.08), 0 4px 8px -2px rgba(23, 61, 48, 0.03)',
      },
    },
  },
  plugins: [],
}
