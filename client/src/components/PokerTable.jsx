// client/src/components/PokerTable.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, UserPlus, Bot } from 'lucide-react';
import PlayerSeat from './PlayerSeat';
import PlayingCard from './PlayingCard';
import { sounds } from '../audio';

export default function PokerTable({
  tableState,
  myPlayerId,
  onSit,
  onStand,
  onAddBot,
  onDealTestHand,
  onResetTable
}) {
  if (!tableState) return null;

  const maxSeats = tableState.config?.maxSeats || 6;
  const seats = tableState.seats || [];
  const communityCards = tableState.communityCards || [];
  const pot = tableState.pot || 0;
  const lastShowdown = tableState.lastShowdown;
  const winningCards = lastShowdown?.winningCards || [];
  const isWaiting = tableState.status === 'WAITING';

  // Trigger celebration on showdown winners
  useEffect(() => {
    if (lastShowdown && lastShowdown.winners && lastShowdown.winners.length > 0) {
      sounds.playWin();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#3B82F6', '#A855F7', '#FFFDF9', '#14472F']
        });
      } catch (e) {}
    }
  }, [lastShowdown]);

  // Straddle Coordinates around the elongated stadium rail
  const getSeatPositionClasses = (index) => {
    switch (index) {
      case 0: // Bottom Center
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 md:top-[94%] md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2';
      case 1: // Bottom-Left Rail
        return 'top-[74%] left-0 -translate-x-1/2 -translate-y-1/2 md:top-[75%] md:left-[8%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 2: // Top-Left Rail
        return 'top-[26%] left-0 -translate-x-1/2 -translate-y-1/2 md:top-[25%] md:left-[8%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 3: // Top Center
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[6%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2';
      case 4: // Top-Right Rail
        return 'top-[26%] left-full -translate-x-1/2 -translate-y-1/2 md:top-[25%] md:left-[92%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 5: // Bottom-Right Rail
        return 'top-[74%] left-full -translate-x-1/2 -translate-y-1/2 md:top-[75%] md:left-[92%] md:-translate-x-1/2 md:-translate-y-1/2';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const isSeated = seats.some(s => s.player?.id === myPlayerId);

  return (
    <div className="relative w-[78vw] max-w-[320px] md:max-w-5xl h-[60dvh] md:h-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-2 sm:p-6 my-auto overflow-visible select-none">
      {/* Outer Table Frame: Elongated Pro Capsule (w-[78vw] max-w-[320px] on mobile) */}
      <div className="relative w-full h-full rounded-[999px] md:rounded-[200px] border-[6px] md:border-[10px] border-[#2C221E] table-rail p-3 sm:p-5 md:p-7 flex items-center justify-center transition-all duration-300 overflow-visible shadow-2xl">
        
        {/* Polished Brass Inlay Hairline */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[999px] md:rounded-[185px] border border-[#F59E0B]/40 pointer-events-none shadow-xs" />

        {/* Inner Baize Felt Texture (overflow-hidden ONLY on this background layer) */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[999px] md:rounded-[185px] poker-felt border-2 border-[#123321] overflow-hidden flex items-center justify-center pointer-events-none">
          {/* Declutter: Watermark visible ONLY on desktop (hidden md:flex) */}
          <div className="hidden md:flex opacity-[0.05] flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest uppercase font-display text-[#FAF8F5]">
              POKERTAB
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono tracking-widest text-[#F59E0B] font-black">
              HIGH STAKES TABLETOP LEDGER
            </span>
          </div>
        </div>

        {/* Decluttered Center Felt Stack */}
        <div className="relative flex flex-col items-center justify-center z-10 gap-2 sm:gap-2.5 px-3 sm:px-6">
          {/* Merged Status / Pot Display: Single pill to eliminate clutter */}
          {pot === 0 && isWaiting ? (
            <div className="px-3 py-1 rounded-full bg-[#141210]/90 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-[#FAF8F5] border border-[#C89D54]/70 shadow-sm">
              WAITING FOR PLAYERS
            </div>
          ) : (
            <motion.div
              key={pot}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-full bg-[#0B1F16]/95 text-[#FAF8F5] border border-[#C89D54]/70 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[#C89D54]">POT:</span>
              <span className="tabular-nums font-black text-[#FDE68A]">
                {pot.toLocaleString()}
              </span>
            </motion.div>
          )}

          {/* Community Cards Display / Mini Outline Frames */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-h-[56px] sm:min-h-[72px] md:min-h-[96px]">
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
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full max-w-[195px] sm:max-w-[260px] md:max-w-[360px]">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="w-8.5 h-12 sm:w-12 sm:h-16 md:w-14 md:h-20 rounded-md border border-[#C89D54]/35 bg-[#0B1F16]/30 flex items-center justify-center text-[10px] font-mono text-[#C89D54]/40"
                  >
                    {idx < 3 ? '♠' : idx === 3 ? '♦' : '♣'}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Showdown Winner Celebration Overlay */}
          <AnimatePresence>
            {lastShowdown && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-1 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border-2 border-[#F59E0B] shadow-hardware-pod flex flex-col items-center max-w-xs text-center z-30"
              >
                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#92400E] font-black">
                  WINNER SHOWDOWN
                </span>
                {lastShowdown.winners?.map((w, i) => (
                  <div key={i} className="text-xs sm:text-sm font-black text-[#121110] flex items-center gap-1 mt-0.5">
                    <span>{w.playerName}</span>
                    <span className="text-[#92400E] tabular-nums font-black">(+{w.amount?.toLocaleString()})</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Perimeter-Anchored Seat Pods (Sleek Circular Micro-Nodes) */}
        {seats.map((seat, index) => {
          const positionClass = getSeatPositionClasses(index);
          const isMe = seat.player?.id === myPlayerId;
          const isDealer = seat.seatNumber === tableState.dealerSeat;
          const isSB = seat.seatNumber === tableState.sbSeat;
          const isBB = seat.seatNumber === tableState.bbSeat;

          return (
            <div
              key={seat.seatNumber}
              className={`absolute z-20 ${positionClass}`}
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

      {/* Sleeker Floating Bottom Control Pill (h-12 px-2 py-1.5 w-[90vw] max-w-[360px]) */}
      {isWaiting && (
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 h-12 px-2 py-1.5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#141210]/20 shadow-lg flex items-center justify-between gap-1.5 w-[90vw] max-w-[360px]">
          {!isSeated ? (
            <button
              onClick={() => onSit(0)}
              className="flex-1 h-full flex items-center justify-center gap-1 px-2 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Sit in Seat 1 immediately"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Quick Sit</span>
            </button>
          ) : (
            <div className="flex-1 h-full flex items-center justify-center px-2 rounded-xl bg-[#F7F4EE] text-[#4A443E] font-mono text-[10px] font-bold uppercase">
              Seated
            </div>
          )}

          {onAddBot && (
            <button
              onClick={onAddBot}
              className="flex-1 h-full flex items-center justify-center gap-1 px-2 rounded-xl bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E40AF] font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Add automated test bot"
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>+ Bot</span>
            </button>
          )}

          {onDealTestHand && (
            <button
              onClick={onDealTestHand}
              className="flex-1 h-full flex items-center justify-center gap-1 px-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Deal full test hand immediately"
            >
              <Play className="w-3.5 h-3.5 shrink-0" />
              <span>Deal</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
