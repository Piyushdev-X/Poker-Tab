/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F7F4EE',
          subtle: '#EFE9DF',
          elevated: '#FFFFFF',
          recessed: '#EAE3D6',
          border: '#D5CCC0',
          'border-subtle': '#E5DEC9',
        },
        felt: {
          DEFAULT: '#0D3522',
          light: '#14472F',
          dark: '#071F14',
          accent: '#F59E0B',
          line: 'rgba(245, 158, 11, 0.35)',
        },
        rail: {
          DEFAULT: '#442917',
          light: '#5A3821',
          dark: '#2D1A0E',
          accent: '#7D4F2C',
        },
        ink: {
          DEFAULT: '#121110', // Deep black-charcoal (> 14:1 contrast on canvas)
          secondary: '#4A443E', // Muted slate-umber (> 7:1 contrast on canvas)
          muted: '#6E645A', // Secondary labels (> 5:1 contrast)
          felt: '#FAF8F5',  // Pure ivory on felt (> 13:1 contrast)
          gold: '#F59E0B',  // High-visibility amber gold on felt (> 8:1 contrast)
        },
        team: {
          alpha: '#92400E',
          'alpha-bg': '#FEF3C7',
          'alpha-border': '#F59E0B',
          omega: '#1E40AF',
          'omega-bg': '#DBEAFE',
          'omega-border': '#3B82F6',
          sigma: '#6B21A8',
          'sigma-bg': '#F3E8FF',
          'sigma-border': '#A855F7',
        },
        suit: {
          spade: '#111827',   // Crisp black
          heart: '#DC2626',   // High-contrast crimson
          diamond: '#2563EB', // High-contrast cobalt
          club: '#059669',    // High-contrast emerald
        }
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Outfit', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'hardware-pod': '0 8px 24px -4px rgba(28, 18, 11, 0.22), 0 2px 6px -1px rgba(28, 18, 11, 0.12)',
        'felt-recessed': 'inset 0 0 100px rgba(3, 15, 9, 0.85), inset 0 2px 4px rgba(245, 158, 11, 0.3)',
        'rail-bevel': '0 24px 60px -10px rgba(28, 18, 11, 0.45), 0 8px 24px -2px rgba(28, 18, 11, 0.3)',
        'tactile-card': '0 4px 14px -2px rgba(28, 18, 11, 0.18), 0 1px 3px rgba(28, 18, 11, 0.1)',
        'glow-active': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-bigtime': '0 0 24px rgba(168, 85, 247, 0.55)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'timer-warning': 'timerPulse 0.9s ease-in-out infinite',
      },
      keyframes: {
        timerPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px rgba(220, 38, 38, 0))' },
          '50%': { transform: 'scale(1.03)', filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.6))' },
        }
      }
    },
  },
  plugins: [],
}
