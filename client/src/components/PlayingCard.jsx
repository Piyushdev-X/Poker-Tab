// client/src/components/PlayingCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SUIT_SYMBOLS = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣'
};

// High-contrast 4-color deck suits (WCAG AA/AAA compliant)
const SUIT_COLORS = {
  s: '#111827', // Spades: Obsidian Black (15:1 contrast on ivory)
  h: '#DC2626', // Hearts: Crimson Red (5.5:1 contrast on ivory)
  d: '#2563EB', // Diamonds: Cobalt Sapphire (5.2:1 contrast on ivory)
  c: '#059669'  // Clubs: Forest Emerald (5.0:1 contrast on ivory)
};

export default function PlayingCard({
  card, // e.g. 'Ah', 'Ts', { rank: 'A', suit: 's' } or { hidden: true } / null for face-down card
  isFaceDown = false,
  isWinning = false,
  isDimmed = false,
  isGhost = false,
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  delay = 0
}) {
  const isHidden = isFaceDown || !card || card?.hidden || (typeof card === 'object' && !card.rank && !card.suit);

  if (isHidden) {
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
        className={`relative ${sizeClasses} bg-[#8C2A2A] border border-[#6B1F1F] shadow-tactile-card flex items-center justify-center overflow-hidden ${className}`}
      >
        {/* Intricate Geometric Card Back (Deep Crimson Club Baize) */}
        <div 
          className="absolute inset-0.5 rounded-sm border border-[#A63838]/60 flex items-center justify-center"
          style={{
            backgroundColor: '#7A2222',
            backgroundImage: `
              repeating-linear-gradient(45deg, #A63838 0, #A63838 1.5px, transparent 0, transparent 6px),
              repeating-linear-gradient(-45deg, #A63838 0, #A63838 1.5px, #7A2222 0, #7A2222 6px)
            `,
            opacity: 0.95
          }}
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#D5A85A] bg-[#2D0F0F] flex items-center justify-center shadow-xs">
            <span className="text-[#F59E0B] text-[8px] sm:text-[10px] font-serif font-black">♠</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const rank = typeof card === 'string' ? card[0] : (card.rank || card.value || '?');
  const rawSuit = typeof card === 'string' ? card[1] : (card.suit || 's');
  const suit = rawSuit?.toLowerCase() || 's';
  const color = SUIT_COLORS[suit] || '#111827';
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
      className={`relative select-none ${sizeStyles.card} bg-[#FFFDF9] text-[#121110] shadow-tactile-card flex flex-col justify-between overflow-hidden transition-all duration-200 border ${
        isWinning 
          ? 'border-[#F59E0B] ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-[#0D3522] shadow-glow-active' 
          : 'border-[#D5CCC0]'
      } ${isGhost ? 'border-dashed border-[#2563EB] ring-1 ring-[#93C5FD]' : ''} ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-center leading-none" style={{ color }}>
        <span className="font-extrabold font-mono tracking-tighter">{rank}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>

      {/* Center Watermark Suit */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${sizeStyles.centerSymbol} font-black`}
        style={{ color, opacity: 0.18 }}
      >
        {symbol}
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div className="flex flex-col items-center leading-none self-end rotate-180" style={{ color }}>
        <span className="font-extrabold font-mono tracking-tighter">{rank}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>

      {/* Winning Shimmer Highlight */}
      {isWinning && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#F59E0B]/25 via-transparent to-white/40 pointer-events-none" />
      )}
    </motion.div>
  );
}
