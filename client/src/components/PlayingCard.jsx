// client/src/components/PlayingCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SUIT_SYMBOLS = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣'
};

const SUIT_COLORS = {
  s: '#0F172A', // Spades: Charcoal Slate
  h: '#DC2626', // Hearts: Crimson Red
  d: '#2563EB', // Diamonds: Cobalt Blue
  c: '#15803D'  // Clubs: Forest Green
};

export default function PlayingCard({
  card, // e.g. 'Ah', 'Ts' or null for face-down card
  isFaceDown = false,
  isWinning = false,
  isDimmed = false,
  isGhost = false,
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  delay = 0
}) {
  if (isFaceDown || !card) {
    const sizeClasses = {
      sm: 'w-8 h-12 rounded',
      md: 'w-12 h-18 rounded-md',
      lg: 'w-16 h-24 rounded-lg'
    }[size];

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay, ease: [0.2, 0.8, 0.2, 1] }}
        className={`relative ${sizeClasses} bg-obsidian-raised border border-brass/40 shadow-elevation-card flex items-center justify-center overflow-hidden ${className}`}
      >
        <div className="absolute inset-1 rounded-sm border border-brass/20 bg-gradient-to-br from-obsidian-surface to-obsidian-deep flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-brass/30 flex items-center justify-center opacity-60">
            <span className="text-brass text-xs font-serif">♠</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const rank = card[0];
  const suit = card[1]?.toLowerCase() || 's';
  const color = SUIT_COLORS[suit] || '#0F172A';
  const symbol = SUIT_SYMBOLS[suit] || '♠';

  const sizeStyles = {
    sm: {
      card: 'w-9 h-13 text-[10px] p-1 rounded',
      centerSymbol: 'text-sm'
    },
    md: {
      card: 'w-13 h-19 text-xs p-1.5 rounded-md',
      centerSymbol: 'text-xl'
    },
    lg: {
      card: 'w-16 h-24 text-sm p-2 rounded-lg',
      centerSymbol: 'text-2xl'
    }
  }[size] || {
    card: 'w-13 h-19 text-xs p-1.5 rounded-md',
    centerSymbol: 'text-xl'
  };

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: -12 }}
      animate={{
        scale: isWinning ? 1.08 : 1,
        opacity: isDimmed ? 0.35 : isGhost ? 0.85 : 1,
        y: isWinning ? -6 : 0
      }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative select-none ${sizeStyles.card} bg-[#F8F7F4] text-slate-900 shadow-elevation-card flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isWinning ? 'ring-2 ring-brass ring-offset-2 ring-offset-felt-dark shadow-glow-active' : 'border border-slate-300'
      } ${isGhost ? 'border-dashed border-team-omega/80 ring-1 ring-team-omega/40' : ''} ${className}`}
    >
      {/* Top Left Rank + Suit */}
      <div className="flex flex-col items-center leading-none w-3">
        <span className="font-extrabold tracking-tight" style={{ color }}>{rank}</span>
        <span className="text-[11px] -mt-0.5" style={{ color }}>{symbol}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none ${sizeStyles.centerSymbol}`} style={{ color }}>
        {symbol}
      </div>

      {/* Bottom Right Inverted Rank + Suit */}
      <div className="flex flex-col items-center leading-none w-3 self-end rotate-180">
        <span className="font-extrabold tracking-tight" style={{ color }}>{rank}</span>
        <span className="text-[11px] -mt-0.5" style={{ color }}>{symbol}</span>
      </div>

      {/* Ghost indicator if teammate sweat mode */}
      {isGhost && (
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-sky-950/90 text-sky-300 text-[7px] text-center font-mono uppercase tracking-wider font-bold">
          Teammate
        </div>
      )}
    </motion.div>
  );
}
