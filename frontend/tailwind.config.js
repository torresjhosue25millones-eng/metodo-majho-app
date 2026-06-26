/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "rose" = verde sage (kept the token name to avoid a sweeping rename across
        // the app; 400/500 are the two official sage hex values).
        rose: {
          50: '#F3F5EE',
          100: '#E6EBDA',
          200: '#D0D9BB',
          300: '#AEBD92',
          400: '#8A9A72',
          500: '#6B7A55',
          600: '#586245',
          700: '#48512F',
          800: '#3A4126',
          900: '#2E331E',
        },
        // "plum" = violeta suave
        plum: {
          50: '#F8F2F7',
          100: '#EFE1ED',
          200: '#DFC5DC',
          300: '#D3BAD3',
          400: '#C4A8C8',
          500: '#AD8CB2',
          600: '#8F6F96',
          700: '#735578',
          800: '#5C4360',
          900: '#4A3650',
        },
        gold: {
          300: '#E2C788',
          400: '#D4B05E',
          500: '#C49A3C',
          600: '#A37D2E',
        },
        cream: '#F5F0E8',
        'deep-plum': '#2E2820', // tinta oscura
        pastel: '#E8C8CC', // rosa
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #8A9A72 0%, #6B7A55 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(138,154,114,0.1) 0%, rgba(196,168,200,0.1) 100%)',
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
