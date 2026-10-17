// client/src/components/PlayerSeat.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import PlayingCard from './PlayingCard';

// High-contrast, WCAG AAA Team Semantic Colors
const TEAM_CONFIG = {
  ALPHA: {
    name: 'Alpha',
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#F59E0B]',
    text: 'text-[#92400E]',
    badge: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]',
    dot: '#F59E0B'
  },
  OMEGA: {
    name: 'Omega',
    bg: 'bg-[#DBEAFE]',
    border: 'border-[#3B82F6]',
    text: 'text-[#1E40AF]',
    badge: 'bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]',
    dot: '#3B82F6'
  },
  SIGMA: {
    name: 'Sigma',
    bg: 'bg-[#F3E8FF]',
    border: 'border-[#A855F7]',
    text: 'text-[#6B21A8]',
    badge: 'bg-[#F3E8FF] text-[#6B21A8] border-[#A855F7]',
    dot: '#A855F7'
  },
  NONE: {
    name: 'Solo',
    bg: 'bg-[#F7F4EE]',
    border: 'border-[#D5CCC0]',
    text: 'text-[#4A443E]',
    badge: 'bg-[#F7F4EE] text-[#4A443E] border-[#D5CCC0]',
    dot: '#6E645A'
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

  // Turn timer countdown ring calculation
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

  // Empty Seat State: Compact square hardware pod that never squishes or wraps
  if (!player) {
    return (
      <div className={`relative flex flex-col items-center justify-center shrink-0 whitespace-nowrap select-none ${className}`}>
        <button
          onClick={() => onSit(seat.seatNumber)}
          className="group relative flex flex-col items-center justify-center w-[68px] h-[68px] sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-[#B8A995] bg-[#FFFFFF] hover:bg-[#FFFFFF] hover:border-[#92400E] hover:scale-105 transition-all duration-150 cursor-pointer shadow-hardware-pod active:scale-[0.96] shrink-0 p-1"
          title={`Sit down in Seat ${seat.seatNumber + 1}`}
        >
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#F7F4EE] group-hover:bg-[#FEF3C7] border border-[#D5CCC0] group-hover:border-[#F59E0B] flex items-center justify-center transition-colors mb-0.5 sm:mb-1 shrink-0">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A443E] group-hover:text-[#92400E] font-bold" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-[#4A443E] group-hover:text-[#92400E] leading-tight">
            SEAT {seat.seatNumber + 1}
          </span>
          <span className="text-[8px] font-mono text-[#6E645A] font-bold hidden sm:block leading-tight">
            + SIT HERE
          </span>
        </button>
      </div>
    );
  }

  // Animated turn timer geometry
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = remainingSec <= 5 && player.isTurn;

  return (
    <div className={`relative flex flex-col items-center shrink-0 whitespace-nowrap select-none ${className}`}>
      {/* Dealer & Blinds Position Badges */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
        {isDealer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#FFFFFF] text-[#121110] border-2 border-[#F59E0B] font-black text-[9px] sm:text-[10px] font-mono flex items-center justify-center shadow-sm"
            title="Dealer Button (D)"
          >
            D
          </motion.div>
        )}
        {isSB && (
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-black text-[7px] sm:text-[8px] font-mono flex items-center justify-center shadow-xs">
            SB
          </div>
        )}
        {isBB && (
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#22C55E] font-black text-[7px] sm:text-[8px] font-mono flex items-center justify-center shadow-xs">
            BB
          </div>
        )}
      </div>

      {/* Main Seat Bento Pod */}
      <div className="relative w-[68px] h-[68px] sm:w-22 sm:h-22 md:w-24 md:h-24 flex items-center justify-center shrink-0">
        {/* Animated SVG Turn Countdown Ring */}
        {player.isTurn && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="rgba(213, 204, 192, 0.4)"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke={isUrgent ? '#DC2626' : '#F59E0B'}
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Hardware Card Body */}
        <div
          className={`relative w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-hardware-pod overflow-hidden p-1 ${
            player.folded
              ? 'opacity-50 grayscale bg-[#EAE3D6] border-[#D5CCC0]'
              : player.isTurn
              ? isUrgent
                ? 'bg-[#FEF2F2] border-[#DC2626] shadow-glow-bigtime animate-timer-warning'
                : 'bg-[#FFFFFF] border-[#F59E0B] ring-2 ring-[#F59E0B]/50 shadow-glow-active'
              : `bg-[#FFFFFF] ${team.border}`
          } ${isMe ? 'ring-2 ring-[#92400E]' : ''}`}
        >
          {/* Team Monogram Header */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`text-[6px] sm:text-[7px] font-mono font-black uppercase tracking-wider px-1 py-0.1 rounded-full border ${team.badge}`}>
              {team.name}
            </span>
          </div>

          {/* Player Name */}
          <span className="text-[10px] sm:text-xs font-black text-[#121110] truncate max-w-[56px] sm:max-w-[74px] px-0.5 text-center leading-tight">
            {player.name} {isMe && <span className="text-[7px] sm:text-[8px] text-[#92400E] font-bold">(You)</span>}
          </span>

          {/* Chip Stack (High-Contrast Bold Tabular Monospace) */}
          <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="tabular-nums font-mono font-black text-[10px] sm:text-xs text-[#121110]">
              {player.chips.toLocaleString()}
            </span>
          </div>

          {/* Floating seconds remaining when active */}
          {player.isTurn && (
            <div className={`absolute bottom-0.5 px-1.5 py-0.2 rounded text-[7px] sm:text-[8px] font-mono font-black tracking-wider ${
              isUrgent ? 'bg-[#DC2626] text-white animate-pulse' : 'bg-[#92400E] text-white'
            }`}>
              {remainingSec}s
            </div>
          )}
        </div>

        {/* Time Bank Pill */}
        {player.timeBank > 0 && !player.folded && (
          <div
            className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-[#FFFFFF] border border-[#D5CCC0] text-[7px] sm:text-[8px] font-mono font-bold text-[#6B21A8] flex items-center gap-0.5 z-30 shadow-xs"
            title={`Time Bank Reserve: +${player.timeBank}s`}
          >
            <Clock className="w-2.5 h-2.5 text-[#6B21A8]" />
            <span className="tabular-nums">+{player.timeBank}s</span>
          </div>
        )}
      </div>

      {/* Hole Cards Peeking Out Above Pod */}
      {player.hasHoleCards && !player.folded && (
        <div className="absolute -top-6 sm:-top-7 flex items-center -space-x-3 sm:-space-x-3.5 z-20">
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
          className="absolute -bottom-6 sm:-bottom-7 px-2 py-0.5 rounded-full bg-[#121110] border border-[#F59E0B] text-[#FAF8F5] text-[9px] sm:text-[10px] font-mono font-black shadow-tactile-card flex items-center gap-1 z-30"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          <span className="tabular-nums font-mono">{player.streetBet.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Folded / All-in Status Tag */}
      {player.isAllIn && (
        <div className="absolute top-1 px-1.5 py-0.2 rounded bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] text-[7px] sm:text-[8px] font-mono font-black uppercase tracking-wider z-30 shadow-xs">
          ALL-IN
        </div>
      )}
      {player.folded && (
        <div className="absolute top-1 px-1.5 py-0.2 rounded bg-[#EAE3D6] border border-[#D5CCC0] text-[#6E645A] text-[7px] sm:text-[8px] font-mono font-black uppercase tracking-wider z-30">
          FOLDED
        </div>
      )}
    </div>
  );
}
