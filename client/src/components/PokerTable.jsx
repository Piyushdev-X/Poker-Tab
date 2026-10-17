// client/src/components/PokerTable.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import PlayerSeat from './PlayerSeat';
import PlayingCard from './PlayingCard';
import { sounds } from '../audio';

export default function PokerTable({
  tableState,
  myPlayerId,
  onSit,
  onStand
}) {
  if (!tableState) return null;

  const maxSeats = tableState.config?.maxSeats || 6;
  const seats = tableState.seats || [];
  const communityCards = tableState.communityCards || [];
  const pot = tableState.pot || 0;
  const lastShowdown = tableState.lastShowdown;
  const winningCards = lastShowdown?.winningCards || [];

  // Trigger confetti and victory sounds when a winner is announced
  useEffect(() => {
    if (lastShowdown && lastShowdown.winners && lastShowdown.winners.length > 0) {
      sounds.playWin();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.55 },
          colors: ['#F5C76B', '#89B9E8', '#C499D9', '#FFFDF9', '#C8DBC8']
        });
      } catch (e) {
        // Ignore in headless / testing
      }
    }
  }, [lastShowdown]);

  // Trigonometric radial positions around the oval table
  // Angles distributed evenly around ellipse with adaptive coordinates
  const getSeatPosition = (index, totalSeats) => {
    // Offset angle so seat 0 is bottom center (player's natural seat)
    const angle = (index / totalSeats) * 2 * Math.PI + Math.PI / 2;
    // Radius in percentage coordinates of container
    const rx = 40; // horizontal percentage radius
    const ry = 37; // vertical percentage radius
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-2 sm:p-4 my-auto">
      {/* Outer Table Rail Frame: Warm Terracotta-Tan / Natural Oak Clay */}
      <div className="relative w-full h-full rounded-[100px] sm:rounded-[140px] md:rounded-[220px] table-rail p-3 sm:p-4 md:p-6 flex items-center justify-center transition-all duration-300">
        {/* Inner Clay Inlay Rim Accent */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[90px] sm:rounded-[125px] md:rounded-[205px] border border-white/60 pointer-events-none" />

        {/* Inner Baize Felt Table Surface: Muted Pastel Sage Felt */}
        <div className="relative w-full h-full rounded-[80px] sm:rounded-[110px] md:rounded-[190px] poker-felt border border-white/70 flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle Watermark Branding in Felt */}
          <div className="absolute opacity-15 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase font-display text-[#3E5C3E]">
              POKERTAB
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono tracking-widest text-[#5E825E] font-bold">
              WARM EDITORIAL TABLETOP LEDGER
            </span>
          </div>

          {/* Table Center: Community Cards & Pot Area */}
          <div className="relative flex flex-col items-center justify-center z-20">
            {/* Street Status Badge */}
            <div className="mb-1.5 sm:mb-2 px-2.5 sm:px-3 py-0.5 rounded-full bg-[#FAF7F2]/90 border border-[#E2D9C8] text-[9px] sm:text-[10px] font-mono tracking-wider text-[#6E6259] uppercase shadow-card-tactile">
              {tableState.status === 'WAITING' ? 'Waiting for players' : tableState.status.replace('_', ' ')}
            </div>

            {/* Total Pot Display (Creamy Parchment with Tabular Monospace) */}
            <motion.div
              key={pot}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#FAF7F2] border border-[#E2D9C8] shadow-card-tactile mb-2 sm:mb-3"
            >
              <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#9E7223] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#6E6259]">Total Pot:</span>
              <span className="tabular-nums font-mono font-extrabold text-sm sm:text-base text-[#2C2623]">
                {pot.toLocaleString()}
              </span>
            </motion.div>

            {/* Community Cards Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-h-[65px] sm:min-h-[80px] md:min-h-[90px]">
              {communityCards.length > 0 ? (
                communityCards.map((card, i) => (
                  <PlayingCard
                    key={`${card}-${i}`}
                    card={card}
                    size="md"
                    isWinning={winningCards.includes(card)}
                    delay={i * 0.1}
                  />
                ))
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 opacity-40">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      className="w-10 h-15 sm:w-12 sm:h-18 rounded-md border border-dashed border-[#5E825E] flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-[#3E5C3E] font-medium"
                    >
                      {idx < 3 ? 'Flop' : idx === 3 ? 'Turn' : 'River'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Showdown Winner Celebration Overlay */}
            <AnimatePresence>
              {lastShowdown && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-2 px-4 py-1.5 sm:py-2 rounded-xl bg-[#FAF7F2]/95 border border-[#E2D9C8] shadow-clay-ambient flex flex-col items-center max-w-xs text-center"
                >
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#9E7223] font-bold">
                    Winner Hand
                  </span>
                  {lastShowdown.winners?.map((w, i) => (
                    <div key={i} className="text-xs sm:text-sm font-bold text-[#2C2623] flex items-center gap-1 mt-0.5">
                      <span>{w.playerName}</span>
                      <span className="text-[#9E7223] tabular-nums">(+{w.amount?.toLocaleString()} chips)</span>
                    </div>
                  ))}
                  {lastShowdown.winners?.[0]?.description && (
                    <span className="text-[10px] sm:text-xs font-mono text-[#6E6259] mt-0.5">
                      {lastShowdown.winners[0].description}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Radial Seats Layout */}
          {seats.map((seat, index) => {
            const pos = getSeatPosition(index, maxSeats);
            const isMe = seat.player?.id === myPlayerId;
            const isDealer = seat.seatNumber === tableState.dealerSeat;
            const isSB = seat.seatNumber === tableState.sbSeat;
            const isBB = seat.seatNumber === tableState.bbSeat;

            return (
              <div
                key={seat.seatNumber}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                style={pos}
              >
                <PlayerSeat
                  seat={seat}
                  isMe={isMe}
                  isDealer={isDealer}
                  isSB={isSB}
                  isBB={isBB}
                  turnExpiresAt={tableState.turnExpiresAt}
                  turnDuration={tableState.config?.turnTimeLimit || 20}
                  winningCards={winningCards}
                  onSit={onSit}
                  onStand={onStand}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
