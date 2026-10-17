// client/src/components/PokerTable.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, UserPlus, RefreshCw, Sparkles, Bot } from 'lucide-react';
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

  // Perimeter Straddle Calculation:
  // Positions seats around the outer leather rail frame
  const getSeatPosition = (index, totalSeats) => {
    // Seat 0 anchored at bottom center (player's natural perspective)
    const angle = (index / totalSeats) * 2 * Math.PI + Math.PI / 2;
    // Horizontal and vertical radii straddling the outer rim (48% and 44%)
    const rx = 48;
    const ry = 44;
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  const isSeated = seats.some(s => s.player?.id === myPlayerId);

  return (
    <div className="relative w-full max-w-5xl h-full max-h-[78dvh] md:max-h-[82dvh] aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] flex items-center justify-center p-3 sm:p-6 my-auto select-none">
      {/* Outer Table Frame: Cognac Saddle Leather & Deep Hand-Turned Oak */}
      <div className="relative w-full h-full rounded-[90px] sm:rounded-[140px] md:rounded-[200px] table-rail p-3.5 sm:p-5 md:p-7 flex items-center justify-center transition-all duration-300">
        
        {/* Polished Brass Inlay Hairline */}
        <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-[80px] sm:rounded-[125px] md:rounded-[185px] border border-[#F59E0B]/40 pointer-events-none shadow-xs" />

        {/* Deep British Racing Green / High-Stakes Emerald Velvet Felt */}
        <div className="relative w-full h-full rounded-[70px] sm:rounded-[110px] md:rounded-[170px] poker-felt border-2 border-[#123321] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Subtle Center Felt Crest Watermark */}
          <div className="absolute opacity-20 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest uppercase font-display text-[#FAF8F5]">
              POKERTAB
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono tracking-widest text-[#F59E0B] font-black">
              HIGH STAKES TABLETOP LEDGER
            </span>
          </div>

          {/* Table Center: Community Cards & Total Pot Module */}
          <div className="relative flex flex-col items-center justify-center z-20">
            {/* Street Status Badge */}
            <div className="mb-1.5 sm:mb-2 px-3 py-0.5 rounded-full bg-[#121110]/90 border border-[#F59E0B]/50 text-[10px] sm:text-[11px] font-mono font-black tracking-widest text-[#FAF8F5] uppercase shadow-tactile-card">
              {tableState.status === 'WAITING' ? 'WAITING FOR PLAYERS' : tableState.status.replace('_', ' ')}
            </div>

            {/* Total Pot Display (High-Contrast Porcelain Pod with Bold Tabular Monospace) */}
            <motion.div
              key={pot}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full bg-[#FFFFFF] border-2 border-[#D5CCC0] shadow-hardware-pod mb-2 sm:mb-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#6E645A] font-black">
                TOTAL POT:
              </span>
              <span className="tabular-nums font-mono font-black text-base sm:text-lg text-[#121110]">
                {pot.toLocaleString()}
              </span>
            </motion.div>

            {/* Community Cards Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-h-[68px] sm:min-h-[82px] md:min-h-[96px]">
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      className="w-10 h-15 sm:w-12 sm:h-18 rounded-md border-2 border-dashed border-[#1E5A3E] bg-[#071F14]/60 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-black text-[#A7D8BA]"
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
                  className="mt-2 px-4 py-2 rounded-2xl bg-[#FFFFFF] border-2 border-[#F59E0B] shadow-hardware-pod flex flex-col items-center max-w-xs text-center z-30"
                >
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#92400E] font-black">
                    WINNER SHOWDOWN
                  </span>
                  {lastShowdown.winners?.map((w, i) => (
                    <div key={i} className="text-xs sm:text-sm font-black text-[#121110] flex items-center gap-1 mt-0.5">
                      <span>{w.playerName}</span>
                      <span className="text-[#92400E] tabular-nums font-black">(+{w.amount?.toLocaleString()} chips)</span>
                    </div>
                  ))}
                  {lastShowdown.winners?.[0]?.description && (
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-[#4A443E] mt-0.5">
                      {lastShowdown.winners[0].description}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Solo Testing Controls Bar (When Waiting for Players) */}
            {isWaiting && (
              <div className="mt-3 flex items-center gap-1.5 sm:gap-2 bg-[#121110]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#F59E0B]/40 shadow-tactile-card z-30">
                {!isSeated && (
                  <button
                    onClick={() => onSit(0)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
                    title="Sit in Seat 1 immediately"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Quick Sit</span>
                  </button>
                )}

                {onAddBot && (
                  <button
                    onClick={onAddBot}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E40AF] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
                    title="Add automated test bot"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>+ Add Bot</span>
                  </button>
                )}

                {onDealTestHand && (
                  <button
                    onClick={onDealTestHand}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all active:scale-[0.96] cursor-pointer shadow-xs"
                    title="Deal full test hand immediately"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Deal Hand</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Perimeter-Anchored Seat Pods (Rendered to straddle the outer rail frame) */}
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
  );
}
