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
          DEFAULT: '#0A0B0E',
          deep: '#060709',
          surface: '#12151C',
          raised: '#1A1E29',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-gold': 'rgba(197, 160, 89, 0.25)',
        },
        felt: {
          DEFAULT: '#0F291E',
          dark: '#0A1C14',
          light: '#16382A',
          border: '#C5A059',
        },
        brass: {
          DEFAULT: '#C5A059',
          light: '#E2C889',
          dark: '#8C6F34',
        },
        team: {
          alpha: '#D4AF37', // Imperial Gold
          'alpha-glow': 'rgba(212, 175, 55, 0.2)',
          omega: '#38BDF8', // Cobalt Ice
          'omega-glow': 'rgba(56, 189, 248, 0.2)',
          sigma: '#A78BFA', // Titanium Amethyst
          'sigma-glow': 'rgba(167, 139, 250, 0.2)',
        },
        suit: {
          spade: '#0F172A',
          heart: '#DC2626',
          diamond: '#2563EB',
          club: '#16A34A',
        }
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Outfit', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'felt-inner': 'inset 0 0 100px rgba(0, 0, 0, 0.75), inset 0 0 20px rgba(0, 0, 0, 0.9)',
        'brass-inlay': '0 0 0 1px rgba(197, 160, 89, 0.4), 0 0 24px rgba(197, 160, 89, 0.15)',
        'elevation-surface': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'elevation-card': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'glow-active': '0 0 15px rgba(197, 160, 89, 0.35)',
        'glow-bigtime': '0 0 25px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'timer-warning': 'timerPulse 1s ease-in-out infinite',
      },
      keyframes: {
        timerPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px rgba(239, 68, 68, 0))' },
          '50%': { transform: 'scale(1.02)', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' },
        }
      }
    },
  },
  plugins: [],
}
