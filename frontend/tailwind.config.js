/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#F0F5F2',
          100: '#D9EBE3',
          200: '#BAD3C8',
          300: '#8BB8A5',
          400: '#6EA891',
          500: '#5C8A6E',
          600: '#4A7059',
          700: '#3D5C49',
          800: '#324A3C',
          900: '#2B3E33',
        },
        plum: {
          50: '#F3EFF9',
          100: '#E5DCF3',
          200: '#CBBAE8',
          300: '#AA90D8',
          400: '#8F6EC8',
          500: '#7B5EA7',
          600: '#634989',
          700: '#523A78',
          800: '#443168',
          900: '#382854',
        },
        gold: {
          300: '#E8D08A',
          400: '#D4B85A',
          500: '#C9A84C',
          600: '#A8883C',
        },
        cream: '#F5EFE0',
        'deep-plum': '#2D2D2D',
        pastel: '#F2C4CE',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #2B3E33 0%, #5C8A6E 60%, #7B5EA7 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(92,138,110,0.1) 0%, rgba(123,94,167,0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};
