/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#FAF7F2',
          light: '#FFFDF9',
          card: '#FAF7F2',
          elevated: '#FFFFFF',
          border: '#E2D9C8',
          'border-subtle': '#EDE6D8',
        },
        sand: {
          DEFAULT: '#EAE2D3',
          light: '#F5F0E6',
          dark: '#DCD2C0',
          recessed: '#E5DCDB',
        },
        felt: {
          DEFAULT: '#C8DBC8',
          light: '#D7E7D7',
          dark: '#B4CCB4',
          deep: '#9FB89F',
          border: 'rgba(255, 255, 255, 0.7)',
        },
        rail: {
          DEFAULT: '#D8C7B2',
          light: '#E5D8C6',
          dark: '#C4B097',
          deep: '#AC9A81',
          shadow: 'rgba(62, 50, 38, 0.16)',
        },
        ink: {
          DEFAULT: '#2C2623',
          muted: '#6E6259',
          subtle: '#9A8E84',
          faint: '#C2B8AC',
        },
        team: {
          alpha: '#9E7223',
          'alpha-bg': '#FDF3D7',
          'alpha-border': '#F2D08B',
          'alpha-badge': '#F5C76B',
          omega: '#36638F',
          'omega-bg': '#E6F0FA',
          'omega-border': '#B3D1F0',
          'omega-badge': '#89B9E8',
          sigma: '#6E4482',
          'sigma-bg': '#F3E8F7',
          'sigma-border': '#D9BBE6',
          'sigma-badge': '#C499D9',
        },
        suit: {
          spade: '#2C2623', // Warm Espresso Charcoal
          heart: '#D96B6B', // Dusty Coral Rose
          diamond: '#5B8AC2', // Soft Cornflower / Pastel Cobalt
          club: '#5E9472',  // Muted Matcha / Sage
        }
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Outfit', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'clay-ambient': '0 12px 32px -8px rgba(62, 50, 38, 0.08), 0 4px 12px -2px rgba(62, 50, 38, 0.04)',
        'clay-card': '0 8px 24px -4px rgba(62, 50, 38, 0.08), 0 2px 6px -1px rgba(62, 50, 38, 0.04)',
        'clay-button': '0 2px 0 0 #DFAFAF',
        'felt-surface': 'inset 0 0 80px rgba(138, 166, 138, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.6)',
        'rail-bevel': '0 18px 40px -10px rgba(62, 50, 38, 0.18), 0 4px 12px -2px rgba(62, 50, 38, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.4)',
        'card-tactile': '0 4px 14px -2px rgba(62, 50, 38, 0.12), 0 1px 3px rgba(62, 50, 38, 0.08)',
        'glow-active': '0 0 16px rgba(158, 114, 35, 0.25)',
        'glow-bigtime': '0 0 20px rgba(196, 153, 217, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'timer-warning': 'timerPulse 1s ease-in-out infinite',
      },
      keyframes: {
        timerPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px rgba(217, 107, 107, 0))' },
          '50%': { transform: 'scale(1.02)', filter: 'drop-shadow(0 0 8px rgba(217, 107, 107, 0.5))' },
        }
      }
    },
  },
  plugins: [],
}
