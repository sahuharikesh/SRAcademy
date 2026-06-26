/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#f0d080',
          dark:    '#7a6220',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          deeper:  '#0a0a0a',
        },
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition:  '600px 0' },
        },
      },
      animation: {
        'fade-up':  'fadeInUp 0.5s cubic-bezier(.22,1,.36,1) both',
        'scale-in': 'scaleIn 0.38s cubic-bezier(.22,1,.36,1) both',
        'shimmer':  'shimmer 1.6s infinite',
      },
      boxShadow: {
        gold:   '0 4px 18px rgba(201,168,76,0.35)',
        'gold-lg': '0 8px 32px rgba(201,168,76,0.45)',
        card:   '0 2px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 16px 40px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
