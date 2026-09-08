/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14202e',
        'ink-soft': '#3d4a5c',
        paper: '#fbf9f4',
        card: '#ffffff',
        primary: {
          DEFAULT: '#0f766e',
          dark: '#0b5750',
          light: '#e6f4f2',
        },
        good: { DEFAULT: '#15803d', light: '#e7f6ec' },
        bad: { DEFAULT: '#b91c1c', light: '#fdecec' },
        warn: { DEFAULT: '#b45309', light: '#fdf3e3' },
      },
      minHeight: {
        // Accessibility rule for this app: nothing tappable is under 80px tall.
        tap: '80px',
        'tap-lg': '120px',
        'tap-xl': '180px',
      },
      minWidth: {
        tap: '80px',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      boxShadow: {
        tap: '0 6px 0 0 rgba(0,0,0,0.14)',
        card: '0 2px 10px rgba(20,32,46,0.08)',
      },
      keyframes: {
        'tier-in': {
          '0%': { opacity: '0', transform: 'scale(0.86)' },
          '55%': { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'arrow-down': {
          '0%,100%': { transform: 'translateY(-14%)' },
          '50%': { transform: 'translateY(14%)' },
        },
        'arrow-up': {
          '0%,100%': { transform: 'translateY(14%)' },
          '50%': { transform: 'translateY(-14%)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        'tier-in': 'tier-in 480ms ease-out both',
        'arrow-down': 'arrow-down 900ms ease-in-out infinite',
        'arrow-up': 'arrow-up 900ms ease-in-out infinite',
        'pop-in': 'pop-in 260ms ease-out both',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
