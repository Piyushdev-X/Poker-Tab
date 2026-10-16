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
          colors: ['#C5A059', '#38BDF8', '#A78BFA', '#F8F7F4']
        });
      } catch (e) {
        // Ignore in headless / testing
      }
    }
  }, [lastShowdown]);

  // Trigonometric radial positions around the oval table
  // Angles distributed evenly around ellipse
  const getSeatPosition = (index, totalSeats) => {
    // Offset angle so seat 0 is bottom center (player's natural seat)
    const angle = (index / totalSeats) * 2 * Math.PI + Math.PI / 2;
    // Radius in percentage coordinates of container
    const rx = 40; // horizontal percentage radius
    const ry = 36; // vertical percentage radius
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full max-w-6xl aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-4">
      {/* Outer Table Rail Frame */}
      <div className="relative w-full h-full rounded-[140px] md:rounded-[220px] table-rail p-4 md:p-6 flex items-center justify-center">
        {/* Brass Inlay Rim Accent */}
        <div className="absolute inset-2.5 md:inset-4 rounded-[125px] md:rounded-[205px] border border-brass/40 pointer-events-none" />

        {/* Inner Baize Felt Table Surface */}
        <div className="relative w-full h-full rounded-[110px] md:rounded-[190px] poker-felt border border-white/5 flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle Watermark Branding in Felt */}
          <div className="absolute opacity-10 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-4xl md:text-6xl font-black tracking-widest uppercase font-display text-white">
              POKERTAB
            </span>
            <span className="text-[10px] md:text-xs font-mono tracking-widest text-brass">
              HIGH STAKES MULTIPLAYER LEDGER
            </span>
          </div>

          {/* Table Center: Community Cards & Pot Area */}
          <div className="relative flex flex-col items-center justify-center z-20">
            {/* Street Status Badge */}
            <div className="mb-2 px-3 py-0.5 rounded-full bg-obsidian-deep/80 border border-white/10 text-[10px] font-mono tracking-widest text-slate-300 uppercase shadow-md">
              {tableState.status === 'WAITING' ? 'Waiting for players' : tableState.status.replace('_', ' ')}
            </div>

            {/* Total Pot Display (Tabular Monospace) */}
            <motion.div
              key={pot}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian-surface/90 border border-brass/40 shadow-brass-inlay mb-4"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-brass animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Pot:</span>
              <span className="tabular-nums font-mono font-extrabold text-base text-brass-light">
                {pot.toLocaleString()}
              </span>
            </motion.div>

            {/* Community Cards Row */}
            <div className="flex items-center gap-2 md:gap-3 min-h-[90px]">
              {communityCards.length > 0 ? (
                communityCards.map((card, i) => (
                  <PlayingCard
                    key={`${card}-${i}`}
                    card={card}
                    size="md"
                    isWinning={winningCards.includes(card)}
                    delay={i * 0.12}
                  />
                ))
              ) : (
                <div className="flex items-center gap-2 opacity-25">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      className="w-13 h-19 rounded-md border border-dashed border-white/30 flex items-center justify-center text-[10px] font-mono text-white/40"
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
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 px-5 py-2 rounded-xl bg-obsidian-surface/95 border border-brass/60 shadow-2xl flex flex-col items-center max-w-sm text-center"
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brass font-bold">
                    Winner Hand
                  </span>
                  {lastShowdown.winners?.map((w, i) => (
                    <div key={i} className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                      <span>{w.playerName}</span>
                      <span className="text-brass tabular-nums">(+{w.amount?.toLocaleString()} chips)</span>
                    </div>
                  ))}
                  {lastShowdown.winners?.[0]?.description && (
                    <span className="text-xs font-mono text-slate-300 mt-0.5">
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
