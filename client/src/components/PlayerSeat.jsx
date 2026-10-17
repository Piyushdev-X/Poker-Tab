// client/src/components/PlayerSeat.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Eye, EyeOff } from 'lucide-react';
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
  className = '',
  // Strict Visibility & Anti-Cheat props
  tableState = null,
  heroPlayer = null,
  currentPlayerId = null,
  isHeroPrivacyHidden = false,
  onToggleHeroPrivacy = null
}) {
  const [progress, setProgress] = useState(1);
  const [remainingSec, setRemainingSec] = useState(0);
  const [localHeroPrivacy, setLocalHeroPrivacy] = useState(false);

  const player = seat.player;
  const team = player ? TEAM_CONFIG[player.team] || TEAM_CONFIG.NONE : null;

  // Strict Hole Card Visibility Rule:
  // Render FACE-UP ONLY IF:
  // 1. Hero's own seat: isMe or player.id === currentPlayerId
  // 2. Showdown: phase === 'SHOWDOWN' and player has not folded
  // 3. Teammate Sweat Mode: teammateSweatMode === true AND heroPlayer.folded === true AND heroPlayer.team === player.team
  const currentPhase = tableState?.phase || tableState?.status || '';
  const isShowdown = currentPhase === 'SHOWDOWN';
  const teammateSweatActive = Boolean(
    tableState?.config?.teammateSweatMode &&
    heroPlayer?.folded === true &&
    heroPlayer?.team &&
    heroPlayer?.team !== 'NONE' &&
    player?.team === heroPlayer?.team
  );

  const isEligibleForFaceUp = Boolean(
    player &&
    !player.folded &&
    (isMe || (isShowdown && !player.folded) || teammateSweatActive)
  );

  // Hero Privacy Toggle state (tap/hold eye to hide/peek cards)
  const isConcealedByHero = isMe && (isHeroPrivacyHidden || localHeroPrivacy);
  const shouldRenderFaceUp = isEligibleForFaceUp && !isConcealedByHero;

  // Determine if player has dealt hole cards
  const hasHoleCards = Boolean(
    player &&
    !player.folded &&
    (player.hasHoleCards || (player.holeCards && player.holeCards.length > 0))
  );

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

  // Fix 1: Sleek 46px circular micro-node on mobile (< md), full card on desktop (md:)
  if (!player) {
    return (
      <div className={`relative flex flex-col items-center justify-center shrink-0 whitespace-nowrap select-none ${className}`}>
        <button
          onClick={() => onSit(seat.seatNumber)}
          className="group relative flex flex-col items-center justify-center w-11 h-11 md:w-20 md:h-20 rounded-full md:rounded-2xl bg-[#141210]/90 md:bg-[#FFFFFF] border border-[#C89D54]/80 md:border-2 md:border-dashed md:border-[#B8A995] text-[#FAF8F5] md:text-[#4A443E] shadow-md transition-transform active:scale-95 shrink-0 backdrop-blur-sm"
          title={`Sit down in Seat ${seat.seatNumber + 1}`}
        >
          {/* Mobile view (< md): 46px circular glass ring */}
          <div className="flex flex-col items-center justify-center md:hidden leading-none">
            <Plus className="w-3.5 h-3.5 text-[#C89D54]" />
            <span className="text-[9px] font-mono font-bold text-[#E7E2D8] mt-0.5">
              S{seat.seatNumber + 1}
            </span>
          </div>

          {/* Desktop view (md:): full tactile hardware pod */}
          <div className="hidden md:flex flex-col items-center justify-center p-1">
            <div className="w-6 h-6 rounded-full bg-[#F7F4EE] group-hover:bg-[#FEF3C7] border border-[#D5CCC0] group-hover:border-[#F59E0B] flex items-center justify-center transition-colors mb-1">
              <Plus className="w-3.5 h-3.5 text-[#4A443E] group-hover:text-[#92400E] font-bold" />
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#4A443E] group-hover:text-[#92400E] leading-tight">
              SEAT {seat.seatNumber + 1}
            </span>
            <span className="text-[8px] font-mono text-[#6E645A] font-bold leading-tight">
              + SIT HERE
            </span>
          </div>
        </button>
      </div>
    );
  }

  // SVG turn timer circumference
  const circumference = 2 * Math.PI * 45; // percentage radius
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
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FFFFFF] text-[#121110] border-2 border-[#F59E0B] font-black text-[8px] sm:text-[9px] font-mono flex items-center justify-center shadow-sm"
            title="Dealer Button (D)"
          >
            D
          </motion.div>
        )}
        {isSB && (
          <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-black text-[7px] font-mono flex items-center justify-center shadow-xs">
            SB
          </div>
        )}
        {isBB && (
          <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#22C55E] font-black text-[7px] font-mono flex items-center justify-center shadow-xs">
            BB
          </div>
        )}
      </div>

      {/* Main Seat Avatar Body */}
      <div className="relative flex flex-col items-center shrink-0">
        {/* 48px Circular Avatar on Mobile, 80px Card on Desktop */}
        <div className="relative w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
          {/* Animated SVG Turn Countdown Ring */}
          {player.isTurn && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="rgba(213, 204, 192, 0.4)"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
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

          {/* Seat Avatar Node */}
          <div
            className={`relative w-full h-full rounded-full md:rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-hardware-pod overflow-hidden ${
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
            <span className={`text-[6px] md:text-[8px] font-mono font-black uppercase tracking-wider px-1 py-0.2 rounded-full border ${team.badge}`}>
              {team.name[0]}<span className="hidden md:inline">{team.name.slice(1)}</span>
            </span>

            {/* Desktop Only: Name & Chips Inside Box */}
            <span className="hidden md:block text-xs font-black text-[#121110] truncate max-w-[70px] px-1 text-center leading-tight mt-0.5">
              {player.name} {isMe && <span className="text-[8px] text-[#92400E] font-bold">(You)</span>}
            </span>
            <div className="hidden md:flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span className="tabular-nums font-mono font-black text-xs text-[#121110]">
                {player.chips.toLocaleString()}
              </span>
            </div>

            {/* Turn timer floating countdown */}
            {player.isTurn && (
              <div className={`absolute bottom-0.5 px-1 py-0.1 rounded text-[7px] font-mono font-black ${
                isUrgent ? 'bg-[#DC2626] text-white animate-pulse' : 'bg-[#92400E] text-white'
              }`}>
                {remainingSec}s
              </div>
            )}
          </div>
        </div>

        {/* Mobile Occupied Seat Pill: overlaps bottom edge of avatar (-mt-2) */}
        <div className="md:hidden -mt-2 px-1.5 py-0.5 rounded-full bg-[#141210] text-[#FAF8F5] border border-[#C89D54] shadow-md min-w-[64px] max-w-[80px] text-center z-20 flex flex-col items-center leading-none">
          <span className="text-[9px] font-semibold text-[#FAF8F5] truncate w-full px-0.5">
            {player.name}
          </span>
          <span className="text-[10px] font-mono font-bold text-[#FDE68A] tabular-nums mt-0.5">
            {player.chips.toLocaleString()}
          </span>
        </div>

        {/* Time Bank Pill */}
        {player.timeBank > 0 && !player.folded && (
          <div
            className="absolute -bottom-3 px-1.5 py-0.2 rounded-full bg-[#FFFFFF] border border-[#D5CCC0] text-[7px] font-mono font-bold text-[#6B21A8] flex items-center gap-0.5 z-30 shadow-xs"
            title={`Time Bank Reserve: +${player.timeBank}s`}
          >
            <Clock className="w-2.5 h-2.5 text-[#6B21A8]" />
            <span className="tabular-nums">+{player.timeBank}s</span>
          </div>
        )}
      </div>

      {/* Hole Cards Peeking Out Above Pod */}
      {hasHoleCards && (
        <div className="absolute -top-5 sm:-top-7 flex items-center -space-x-3 sm:-space-x-3.5 z-20">
          {shouldRenderFaceUp && player.holeCards && Array.isArray(player.holeCards) ? (
            player.holeCards.map((card, i) => (
              <PlayingCard
                key={`${typeof card === 'string' ? card : (card.rank || '') + (card.suit || '')}-${i}`}
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

          {/* Hero IRL Privacy Toggle: Tap/Hold eye icon to conceal or peek hole cards */}
          {isMe && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleHeroPrivacy) {
                  onToggleHeroPrivacy();
                } else {
                  setLocalHeroPrivacy(prev => !prev);
                }
              }}
              className="ml-2.5 p-1 rounded-full bg-[#141210]/90 hover:bg-[#141210] text-[#FAF8F5] border border-[#C89D54]/70 shadow-md transition-all active:scale-90 cursor-pointer flex items-center justify-center z-30"
              title={isConcealedByHero ? "Tap to Peek Hole Cards" : "Tap to Conceal Hole Cards (IRL Privacy)"}
              aria-label={isConcealedByHero ? "Reveal hole cards" : "Conceal hole cards"}
            >
              {isConcealedByHero ? (
                <EyeOff className="w-3 h-3 text-[#E2D8CC]" />
              ) : (
                <Eye className="w-3 h-3 text-[#F59E0B]" />
              )}
            </button>
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
