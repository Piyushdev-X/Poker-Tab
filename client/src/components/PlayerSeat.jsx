// client/src/components/PlayerSeat.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, PlusCircle } from 'lucide-react';
import PlayingCard from './PlayingCard';

const TEAM_CONFIG = {
  ALPHA: {
    name: 'Alpha',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  OMEGA: {
    name: 'Omega',
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/50',
    text: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  SIGMA: {
    name: 'Sigma',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  NONE: {
    name: 'Solo',
    bg: 'bg-slate-900/40',
    border: 'border-slate-700/50',
    text: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-300 border-slate-700'
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
          className="group relative flex flex-col items-center justify-center w-24 h-24 rounded-full border border-dashed border-white/20 bg-obsidian-surface/60 hover:bg-obsidian-raised/80 hover:border-brass/60 transition-all duration-200 cursor-pointer shadow-elevation-surface active:scale-[0.96]"
        >
          <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-brass transition-colors mb-1" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-brass">
            Seat {seat.seatNumber + 1}
          </span>
        </button>
      </div>
    );
  }

  // SVG ring geometry for the turn timer
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = remainingSec <= 5 && player.isTurn;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Dealer / Blinds Puck Badges */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
        {isDealer && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-white text-slate-900 border-2 border-slate-950 font-extrabold text-[11px] font-mono flex items-center justify-center shadow-lg"
            title="Dealer Button"
          >
            D
          </motion.div>
        )}
        {isSB && (
          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 border border-slate-900 font-bold text-[9px] font-mono flex items-center justify-center shadow-md">
            SB
          </div>
        )}
        {isBB && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 border border-slate-900 font-bold text-[9px] font-mono flex items-center justify-center shadow-md">
            BB
          </div>
        )}
      </div>

      {/* Main Seat Avatar Pod */}
      <div className="relative w-26 h-26 flex items-center justify-center">
        {/* SVG Turn Countdown Progress Ring */}
        {player.isTurn && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10">
            <circle
              cx="52"
              cy="52"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="52"
              cy="52"
              r={radius}
              stroke={isUrgent ? '#EF4444' : '#C5A059'}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Player Card Body */}
        <div
          className={`relative w-22 h-22 rounded-full border flex flex-col items-center justify-center transition-all duration-300 shadow-elevation-surface overflow-hidden ${
            player.folded
              ? 'opacity-40 grayscale bg-obsidian-deep border-white/5'
              : player.isTurn
              ? isUrgent
                ? 'bg-red-950/40 border-red-500 shadow-glow-bigtime animate-timer-warning'
                : 'bg-obsidian-raised border-brass shadow-glow-active'
              : `${team.bg} ${team.border} bg-obsidian-surface`
          } ${isMe ? 'ring-2 ring-white/20' : ''}`}
        >
          {/* Team Monogram Header */}
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${team.badge}`}>
              {team.name}
            </span>
          </div>

          {/* Player Name */}
          <span className="text-xs font-semibold text-slate-100 truncate max-w-[76px] px-1 text-center leading-tight">
            {player.name} {isMe && <span className="text-[9px] text-brass font-normal">(You)</span>}
          </span>

          {/* Chip Stack (Tabular Monospace) */}
          <span className="tabular-nums font-mono font-bold text-xs text-brass-light mt-0.5">
            {player.chips.toLocaleString()}
          </span>

          {/* Turn timer badge when active */}
          {player.isTurn && (
            <div className={`absolute bottom-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
              isUrgent ? 'bg-red-500 text-white' : 'bg-brass text-obsidian'
            }`}>
              {remainingSec}s
            </div>
          )}
        </div>

        {/* Time Bank Reserve Pill */}
        {player.timeBank > 0 && !player.folded && (
          <div
            className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-obsidian-deep/90 border border-white/10 text-[8px] font-mono text-slate-400 flex items-center gap-0.5 z-20"
            title={`Time Bank reserve: +${player.timeBank}s`}
          >
            <Clock className="w-2.5 h-2.5 text-brass" />
            <span className="tabular-nums">+{player.timeBank}s</span>
          </div>
        )}
      </div>

      {/* Hole Cards Display */}
      {player.hasHoleCards && !player.folded && (
        <div className="absolute -top-7 flex items-center -space-x-3.5 z-10">
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
          initial={{ scale: 0.8, opacity: 0, y: 5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="absolute -bottom-8 px-2 py-0.5 rounded-full bg-obsidian-raised border border-brass/50 text-brass text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 z-20"
        >
          <div className="w-2 h-2 rounded-full bg-brass/80" />
          <span className="tabular-nums">{player.streetBet.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Folded / All-in Status Tag */}
      {player.isAllIn && (
        <div className="absolute top-2 px-1.5 py-0.2 rounded bg-amber-500/90 text-slate-950 text-[9px] font-mono font-extrabold uppercase tracking-wider z-20">
          ALL-IN
        </div>
      )}
      {player.folded && (
        <div className="absolute top-2 px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-mono uppercase tracking-wider z-20">
          FOLDED
        </div>
      )}
    </div>
  );
}
