// client/src/components/PlayerSeat.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, PlusCircle } from 'lucide-react';
import PlayingCard from './PlayingCard';

// Muted Pastel Team Affiliations & Semantic Accents
const TEAM_CONFIG = {
  ALPHA: {
    name: 'Alpha',
    bg: 'bg-[#FDF3D7]',
    border: 'border-[#F2D08B]',
    text: 'text-[#9E7223]',
    badge: 'bg-[#FDF3D7] text-[#9E7223] border-[#F2D08B]',
    accentDot: '#F5C76B'
  },
  OMEGA: {
    name: 'Omega',
    bg: 'bg-[#E6F0FA]',
    border: 'border-[#B3D1F0]',
    text: 'text-[#36638F]',
    badge: 'bg-[#E6F0FA] text-[#36638F] border-[#B3D1F0]',
    accentDot: '#89B9E8'
  },
  SIGMA: {
    name: 'Sigma',
    bg: 'bg-[#F3E8F7]',
    border: 'border-[#D9BBE6]',
    text: 'text-[#6E4482]',
    badge: 'bg-[#F3E8F7] text-[#6E4482] border-[#D9BBE6]',
    accentDot: '#C499D9'
  },
  NONE: {
    name: 'Solo',
    bg: 'bg-[#EAE2D3]',
    border: 'border-[#DCD2C0]',
    text: 'text-[#6E6259]',
    badge: 'bg-[#FAF7F2] text-[#6E6259] border-[#DCD2C0]',
    accentDot: '#9A8E84'
  }
};

export default function PlayerSeat({
  seat, // { seatNumber, player: { id, name, team, chips, holeCards, isTurn, folded, isAllIn, streetBet, timeBank, isCardVisible } }
  isMe = false,
  isDealer = false,
  isSB = false,
  isBB = false,
  turnExpiresAt = null,
  turnDuration = 20,
  winningCards = [],
  onSit,
  onStand,
  className = ''
}) {
  const [progress, setProgress] = useState(1);
  const [remainingSec, setRemainingSec] = useState(0);

  const player = seat.player;
  const team = player ? TEAM_CONFIG[player.team] || TEAM_CONFIG.NONE : null;

  // Turn timer countdown ring logic
  useEffect(() => {
    if (!player || !player.isTurn || !turnExpiresAt) {
      setProgress(1);
      setRemainingSec(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeftMs = Math.max(0, turnExpiresAt - now);
      const totalMs = turnDuration * 1000;
      const ratio = Math.min(1, timeLeftMs / totalMs);

      setProgress(ratio);
      setRemainingSec(Math.ceil(timeLeftMs / 1000));
    }, 50);

    return () => clearInterval(interval);
  }, [player?.isTurn, turnExpiresAt, turnDuration]);

  // Empty seat representation
  if (!player) {
    return (
      <div className={`relative flex flex-col items-center justify-center ${className}`}>
        <button
          onClick={() => onSit(seat.seatNumber)}
          className="group relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-dashed border-[#C4B097]/60 bg-[#FAF7F2]/60 hover:bg-[#FFFDF9] hover:border-[#9E7223]/70 transition-all duration-200 cursor-pointer shadow-card-tactile active:scale-[0.96]"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#9A8E84] group-hover:text-[#9E7223] transition-colors mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#9A8E84] group-hover:text-[#9E7223]">
            Seat {seat.seatNumber + 1}
          </span>
        </button>
      </div>
    );
  }

  // SVG ring geometry for the turn timer
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = remainingSec <= 5 && player.isTurn;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Dealer / Blinds Puck Badges */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
        {isDealer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FAF7F2] text-[#2C2623] border-2 border-[#D8C7B2] font-extrabold text-[10px] sm:text-[11px] font-mono flex items-center justify-center shadow-card-tactile"
            title="Dealer Button"
          >
            D
          </motion.div>
        )}
        {isSB && (
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#FDF3D7] text-[#9E7223] border border-[#F2D08B] font-bold text-[8px] sm:text-[9px] font-mono flex items-center justify-center shadow-xs">
            SB
          </div>
        )}
        {isBB && (
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#DFF0E4] text-[#2B6340] border border-[#A8D1B5] font-bold text-[8px] sm:text-[9px] font-mono flex items-center justify-center shadow-xs">
            BB
          </div>
        )}
      </div>

      {/* Main Seat Avatar Pod */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 flex items-center justify-center">
        {/* SVG Turn Countdown Progress Ring */}
        {player.isTurn && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="rgba(216, 199, 178, 0.4)"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke={isUrgent ? '#D96B6B' : '#9E7223'}
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Player Card Body (Creamy Parchment Pod) */}
        <div
          className={`relative w-17 h-17 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full border flex flex-col items-center justify-center transition-all duration-300 shadow-card-tactile overflow-hidden ${
            player.folded
              ? 'opacity-40 grayscale bg-[#EAE2D3] border-[#DCD2C0]'
              : player.isTurn
              ? isUrgent
                ? 'bg-[#FDF2F2] border-[#D96B6B] shadow-glow-bigtime animate-timer-warning'
                : 'bg-[#FAF7F2] border-[#9E7223] ring-2 ring-[#F2D08B] shadow-glow-active'
              : `${team.bg} ${team.border}`
          } ${isMe ? 'ring-2 ring-[#9E7223]/50' : ''}`}
        >
          {/* Team Monogram Header */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${team.badge}`}>
              {team.name}
            </span>
          </div>

          {/* Player Name */}
          <span className="text-[11px] sm:text-xs font-semibold text-[#2C2623] truncate max-w-[65px] sm:max-w-[76px] px-1 text-center leading-tight">
            {player.name} {isMe && <span className="text-[8px] sm:text-[9px] text-[#9E7223] font-normal">(You)</span>}
          </span>

          {/* Chip Stack (Tabular Monospace) */}
          <span className="tabular-nums font-mono font-bold text-[11px] sm:text-xs text-[#2C2623] mt-0.5">
            {player.chips.toLocaleString()}
          </span>

          {/* Turn timer badge when active */}
          {player.isTurn && (
            <div className={`absolute bottom-0.5 sm:bottom-1 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold ${
              isUrgent ? 'bg-[#D96B6B] text-white' : 'bg-[#9E7223] text-[#FFFDF9]'
            }`}>
              {remainingSec}s
            </div>
          )}
        </div>

        {/* Time Bank Reserve Pill */}
        {player.timeBank > 0 && !player.folded && (
          <div
            className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-[#FAF7F2] border border-[#E2D9C8] text-[7px] sm:text-[8px] font-mono text-[#6E6259] flex items-center gap-0.5 z-20 shadow-xs"
            title={`Time Bank reserve: +${player.timeBank}s`}
          >
            <Clock className="w-2.5 h-2.5 text-[#6E4482]" />
            <span className="tabular-nums font-bold">+{player.timeBank}s</span>
          </div>
        )}
      </div>

      {/* Hole Cards Display */}
      {player.hasHoleCards && !player.folded && (
        <div className="absolute -top-6 sm:-top-7 flex items-center -space-x-3 sm:-space-x-3.5 z-10">
          {player.isCardVisible && player.holeCards ? (
            player.holeCards.map((card, i) => (
              <PlayingCard
                key={`${card}-${i}`}
                card={card}
                size="sm"
                isWinning={winningCards.includes(card)}
                isGhost={!isMe}
                delay={i * 0.08}
              />
            ))
          ) : (
            <>
              <PlayingCard isFaceDown size="sm" delay={0} />
              <PlayingCard isFaceDown size="sm" delay={0.08} />
            </>
          )}
        </div>
      )}

      {/* Street Bet Chip Indicator */}
      {player.streetBet > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 4 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="absolute -bottom-7 sm:-bottom-8 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E2D9C8] text-[#8C4A1D] text-[9px] sm:text-[10px] font-mono font-bold shadow-card-tactile flex items-center gap-1 z-20"
        >
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8C4A1D]" />
          <span className="tabular-nums">{player.streetBet.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Folded / All-in Status Tag */}
      {player.isAllIn && (
        <div className="absolute top-1.5 px-1.5 py-0.2 rounded bg-[#FBE5D2] border border-[#E3B48D] text-[#8C4A1D] text-[8px] sm:text-[9px] font-mono font-extrabold uppercase tracking-wider z-20 shadow-xs">
          ALL-IN
        </div>
      )}
      {player.folded && (
        <div className="absolute top-1.5 px-1.5 py-0.2 rounded bg-[#EAE2D3] border border-[#DCD2C0] text-[#9A8E84] text-[8px] sm:text-[9px] font-mono uppercase tracking-wider z-20">
          FOLDED
        </div>
      )}
    </div>
  );
}
