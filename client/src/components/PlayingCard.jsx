// client/src/components/PlayingCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SUIT_SYMBOLS = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣'
};

// Pastel-tinted 4-color deck suits
const SUIT_COLORS = {
  s: '#2C2623', // Spades: Warm Espresso Charcoal
  h: '#D96B6B', // Hearts: Dusty Coral Rose
  d: '#5B8AC2', // Diamonds: Soft Cornflower / Pastel Cobalt
  c: '#5E9472'  // Clubs: Muted Matcha / Sage
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
      sm: 'w-7 h-10 md:w-8 md:h-12 rounded',
      md: 'w-10 h-15 sm:w-12 sm:h-18 rounded-md',
      lg: 'w-13 h-19 sm:w-16 sm:h-24 rounded-lg'
    }[size] || 'w-10 h-15 sm:w-12 sm:h-18 rounded-md';

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay, ease: [0.2, 0.8, 0.2, 1] }}
        className={`relative ${sizeClasses} bg-[#E8C5B0] border border-[#D5B29D] shadow-card-tactile flex items-center justify-center overflow-hidden ${className}`}
      >
        {/* Pastel Tartan / Botanical Geometric Card Back */}
        <div 
          className="absolute inset-1 rounded-sm border border-[#CFA992] flex items-center justify-center"
          style={{
            backgroundColor: '#E8C5B0',
            backgroundImage: `
              repeating-linear-gradient(45deg, #A3BFA8 0, #A3BFA8 2px, transparent 0, transparent 8px),
              repeating-linear-gradient(-45deg, #A3BFA8 0, #A3BFA8 2px, #E8C5B0 0, #E8C5B0 8px)
            `,
            opacity: 0.88
          }}
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/70 bg-[#FAF7F2]/90 flex items-center justify-center shadow-xs">
            <span className="text-[#8C4A1D] text-[9px] sm:text-[11px] font-serif">♠</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const rank = card[0];
  const suit = card[1]?.toLowerCase() || 's';
  const color = SUIT_COLORS[suit] || '#2C2623';
  const symbol = SUIT_SYMBOLS[suit] || '♠';

  const sizeStyles = {
    sm: {
      card: 'w-7 h-10 md:w-8 md:h-12 text-[9px] md:text-[10px] p-0.5 md:p-1 rounded',
      centerSymbol: 'text-xs md:text-sm'
    },
    md: {
      card: 'w-10 h-15 sm:w-12 sm:h-18 text-[11px] sm:text-xs p-1 sm:p-1.5 rounded-md',
      centerSymbol: 'text-lg sm:text-xl'
    },
    lg: {
      card: 'w-13 h-19 sm:w-16 sm:h-24 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg',
      centerSymbol: 'text-xl sm:text-2xl'
    }
  }[size] || {
    card: 'w-10 h-15 sm:w-12 sm:h-18 text-[11px] sm:text-xs p-1 sm:p-1.5 rounded-md',
    centerSymbol: 'text-lg sm:text-xl'
  };

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: -10 }}
      animate={{
        scale: isWinning ? 1.08 : 1,
        opacity: isDimmed ? 0.35 : isGhost ? 0.85 : 1,
        y: isWinning ? -6 : 0
      }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative select-none ${sizeStyles.card} bg-[#FFFDF9] text-[#2C2623] shadow-card-tactile flex flex-col justify-between overflow-hidden transition-all duration-200 border ${
        isWinning 
          ? 'border-[#9E7223] ring-2 ring-[#F2D08B] ring-offset-2 ring-offset-[#C8DBC8] shadow-glow-active' 
          : 'border-[#E5DEC9]'
      } ${isGhost ? 'border-dashed border-[#5B8AC2] ring-1 ring-[#B3D1F0]' : ''} ${className}`}
    >
      {/* Top Left Rank + Suit */}
      <div className="flex flex-col items-center leading-none w-3">
        <span className="font-extrabold tracking-tight" style={{ color }}>{rank}</span>
        <span className="text-[10px] sm:text-[11px] -mt-0.5" style={{ color }}>{symbol}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none ${sizeStyles.centerSymbol}`} style={{ color }}>
        {symbol}
      </div>

      {/* Bottom Right Inverted Rank + Suit */}
      <div className="flex flex-col items-center leading-none w-3 self-end rotate-180">
        <span className="font-extrabold tracking-tight" style={{ color }}>{rank}</span>
        <span className="text-[10px] sm:text-[11px] -mt-0.5" style={{ color }}>{symbol}</span>
      </div>

      {/* Ghost indicator if teammate sweat mode */}
      {isGhost && (
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-[#E6F0FA] text-[#36638F] text-[7px] text-center font-mono uppercase tracking-wider font-bold border-t border-[#B3D1F0]">
          Teammate
        </div>
      )}
    </motion.div>
  );
}
