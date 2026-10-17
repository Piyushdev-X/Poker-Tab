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

  // Bug 2 Fix: Precise Straddle Coordinates
  // Anchors seats straddling the outer oak/leather rail without clipping
  const getSeatPositionClasses = (index) => {
    switch (index) {
      case 0: // Bottom Center
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 md:top-[94%] md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2';
      case 1: // Bottom-Left
        return 'top-[74%] left-0 -translate-x-1/2 -translate-y-1/2 md:top-[75%] md:left-[8%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 2: // Top-Left
        return 'top-[26%] left-0 -translate-x-1/2 -translate-y-1/2 md:top-[25%] md:left-[8%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 3: // Top Center
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[6%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2';
      case 4: // Top-Right
        return 'top-[26%] left-full -translate-x-1/2 -translate-y-1/2 md:top-[25%] md:left-[92%] md:-translate-x-1/2 md:-translate-y-1/2';
      case 5: // Bottom-Right
        return 'top-[74%] left-full -translate-x-1/2 -translate-y-1/2 md:top-[75%] md:left-[92%] md:-translate-x-1/2 md:-translate-y-1/2';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const isSeated = seats.some(s => s.player?.id === myPlayerId);

  return (
    <div className="relative w-[84vw] max-w-[340px] md:max-w-5xl h-[54dvh] sm:h-[58dvh] md:h-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-2 sm:p-6 my-auto overflow-visible">
      {/* Outer Table Frame: Cognac Saddle Leather & Deep Oak Bevel (overflow-visible) */}
      <div className="relative w-full h-full rounded-[90px] sm:rounded-[140px] md:rounded-[200px] table-rail p-3.5 sm:p-5 md:p-7 flex items-center justify-center transition-all duration-300 overflow-visible">
        
        {/* Polished Brass Inlay Hairline */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[80px] sm:rounded-[125px] md:rounded-[185px] border border-[#F59E0B]/40 pointer-events-none shadow-xs" />

        {/* Inner Baize Felt Texture (overflow-hidden ONLY on this background layer) */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[80px] sm:rounded-[125px] md:rounded-[185px] poker-felt border-2 border-[#123321] overflow-hidden flex items-center justify-center pointer-events-none">
          {/* Bug 4 Fix: Subdued Table Center Crest Watermark (opacity 0.05) */}
          <div className="opacity-[0.05] flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest uppercase font-display text-[#FAF8F5]">
              POKERTAB
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono tracking-widest text-[#F59E0B] font-black">
              HIGH STAKES TABLETOP LEDGER
            </span>
          </div>
        </div>

        {/* Bug 4 Fix: Structured Center Table Focal Zone (Community Cards & Total Pot) */}
        <div className="relative flex flex-col items-center justify-center z-10 gap-2 sm:gap-3 px-3 sm:px-6">
          {/* Street Status Badge */}
          <div className="px-3 py-0.5 rounded-full bg-[#121110]/95 border border-[#F59E0B]/50 text-[9px] sm:text-[11px] font-mono font-black tracking-widest text-[#FAF8F5] uppercase shadow-tactile-card">
            {tableState.status === 'WAITING' ? 'WAITING FOR PLAYERS' : tableState.status.replace('_', ' ')}
          </div>

          {/* Total Pot Display */}
          <motion.div
            key={pot}
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1 rounded-full bg-[#FFFFFF] border-2 border-[#D5CCC0] shadow-hardware-pod"
          >
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="text-[9px] sm:text-xs font-mono uppercase tracking-wider text-[#6E645A] font-black">
              POT:
            </span>
            <span className="tabular-nums font-mono font-black text-sm sm:text-lg text-[#121110]">
              {pot.toLocaleString()}
            </span>
          </motion.div>

          {/* Community Cards Slots */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-h-[58px] sm:min-h-[76px] md:min-h-[96px]">
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
              <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-[210px] sm:max-w-[280px] md:max-w-[360px]">
                {[0, 1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="w-9 h-13 sm:w-12 sm:h-17 md:w-14 md:h-20 rounded-lg border-2 border-dashed border-[#F59E0B]/40 bg-[#071F14]/70 flex items-center justify-center text-[8px] sm:text-[10px] font-mono font-black text-[#A7D8BA]"
                  >
                    {idx < 3 ? 'FLOP' : idx === 3 ? 'TURN' : 'RIVER'}
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

        {/* Bug 2 Fix: Perimeter-Anchored Seat Pods (Outside Felt, Straddling Rail) */}
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

      {/* Bug 3 Fix: Bottom Floating Host / Solo Testing Dock (Outside Table Felt) */}
      {isWaiting && (
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-md bg-[#FFFFFF] border-2 border-[#121110] rounded-2xl p-2 sm:p-2.5 shadow-2xl grid grid-cols-3 gap-2">
          {!isSeated ? (
            <button
              onClick={() => onSit(0)}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
              title="Sit in Seat 1 immediately"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Quick Sit</span>
            </button>
          ) : (
            <div className="flex items-center justify-center py-2 px-1 rounded-xl bg-[#F7F4EE] text-[#4A443E] font-mono text-[10px] font-bold uppercase truncate">
              Seated (#1)
            </div>
          )}

          {onAddBot && (
            <button
              onClick={onAddBot}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E40AF] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
              title="Add automated test bot"
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Add Bot</span>
            </button>
          )}

          {onDealTestHand && (
            <button
              onClick={onDealTestHand}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
              title="Deal full test hand immediately"
            >
              <Play className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Deal Hand</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
