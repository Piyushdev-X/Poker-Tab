// client/src/components/ActionDock.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Minus, Plus, Zap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PlayingCard from './PlayingCard';
import { sounds } from '../audio';

export default function ActionDock({
  tableState,
  myPlayer,
  mySeat,
  onAction,
  onBigTime
}) {
  if (!tableState || !myPlayer) return null;

  const currentBet = tableState.currentBet || 0;
  const myStreetBet = myPlayer.streetBet || 0;
  const toCall = Math.max(0, currentBet - myStreetBet);
  const minRaise = tableState.minRaise || tableState.config.bigBlind;
  const minTargetBet = currentBet + minRaise;
  const maxTargetBet = myStreetBet + myPlayer.chips;
  const potSize = tableState.pot || 0;

  const [betAmount, setBetAmount] = useState(minTargetBet);

  // Sync bet amount whenever turn or currentBet changes
  useEffect(() => {
    const validMin = Math.min(maxTargetBet, Math.max(minTargetBet, currentBet > 0 ? currentBet + minRaise : tableState.config.bigBlind));
    setBetAmount(validMin);
  }, [currentBet, minRaise, maxTargetBet, tableState.activeSeat]);

  const canCheck = toCall === 0;
  const isMyTurn = myPlayer.isTurn;
  const isAllIn = myPlayer.isAllIn;
  const isFolded = myPlayer.folded;
  const timeBank = myPlayer.timeBank || 0;

  // Quick sizing calculations
  const calculateQuickSize = (ratio) => {
    if (ratio === 'ALL_IN') return maxTargetBet;
    if (ratio === 'MIN') return Math.min(maxTargetBet, minTargetBet);

    const calculated = Math.round(currentBet + potSize * ratio);
    return Math.min(maxTargetBet, Math.max(minTargetBet, calculated));
  };

  const handleSliderChange = (e) => {
    setBetAmount(parseInt(e.target.value));
    sounds.playChip();
  };

  const adjustBet = (delta) => {
    const next = Math.min(maxTargetBet, Math.max(minTargetBet, betAmount + delta));
    setBetAmount(next);
    sounds.playChip();
  };

  const handleActionClick = (action, amount = 0) => {
    if (action === 'fold') sounds.playCard();
    else if (action === 'check') sounds.playCheck();
    else sounds.playChip();

    onAction(action, amount);
  };

  const handleBigTimeClick = () => {
    sounds.playBigTime();
    onBigTime();
  };

  const [isPeekHidden, setIsPeekHidden] = useState(false);

  return (
    <div className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 sm:px-4 z-40 pb-safe select-none">
      <div className="relative bg-[#FFFFFF]/98 backdrop-blur-xl border-2 border-[#D5CCC0] rounded-2xl p-3 sm:p-4 shadow-hardware-pod flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Section: Hole Cards & Live Hand Telemetry */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center -space-x-3 sm:-space-x-4 relative">
            {!isPeekHidden && myPlayer.holeCards && myPlayer.holeCards.length === 2 ? (
              myPlayer.holeCards.map((c, i) => (
                <PlayingCard
                  key={`${typeof c === 'string' ? c : (c.rank || '') + (c.suit || '')}-${i}`}
                  card={c}
                  size="md"
                  isWinning={tableState.lastShowdown?.winningCards?.includes(c)}
                  delay={i * 0.05}
                />
              ))
            ) : (
              <>
                <PlayingCard isFaceDown size="md" />
                <PlayingCard isFaceDown size="md" delay={0.05} />
              </>
            )}

            {/* Privacy Peek Toggle */}
            <button
              type="button"
              onClick={() => setIsPeekHidden(prev => !prev)}
              className="ml-2 p-1.5 rounded-full bg-[#141210]/90 hover:bg-[#141210] text-[#FAF8F5] border border-[#C89D54]/70 shadow-xs transition-transform active:scale-90 cursor-pointer flex items-center justify-center shrink-0 z-10"
              title={isPeekHidden ? "Tap to Peek Hole Cards" : "Tap to Conceal Hole Cards (IRL Privacy)"}
              aria-label={isPeekHidden ? "Reveal hole cards" : "Conceal hole cards"}
            >
              {isPeekHidden ? (
                <EyeOff className="w-3.5 h-3.5 text-[#E2D8CC]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
              )}
            </button>
          </div>

          {/* Telemetry info block */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#6E645A] font-bold">
                HAND STRENGTH
              </span>
              {tableState.liveTelemetry?.tier === 'nuts' && (
                <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-black text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.2 rounded border border-[#F59E0B]">
                  <Flame className="w-2.5 h-2.5" /> High Equity
                </span>
              )}
            </div>

            <div className="text-sm sm:text-base font-black text-[#121110] flex items-center gap-1">
              {tableState.liveTelemetry?.strength || (isFolded ? 'Folded' : 'Waiting for Cards...')}
            </div>

            {tableState.liveTelemetry?.description && (
              <div className="text-[10px] sm:text-[11px] text-[#4A443E] font-mono font-bold">
                {tableState.liveTelemetry.description}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Section: Controls & Action Triggers */}
        {isFolded ? (
          <div className="text-xs sm:text-sm font-mono font-bold text-[#6E645A] py-2 sm:py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#92400E]" />
            Folded this hand — observing telemetry
          </div>
        ) : isAllIn ? (
          <div className="text-xs sm:text-sm font-mono font-black text-[#92400E] py-2 sm:py-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F59E0B]" />
            All-In ({myPlayer.chips + myStreetBet} total) — awaiting runout
          </div>
        ) : (
          <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-2">
            {/* Quick-sizing pills + Bet Slider (When active turn) */}
            {isMyTurn && myPlayer.chips > toCall && (
              <div className="flex flex-col w-full md:w-84 gap-1.5 bg-[#F7F4EE] p-2 rounded-xl border border-[#D5CCC0]">
                {/* Sizing Pills */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('MIN'))}
                    className="flex-1 py-1.5 min-h-[34px] text-[10px] font-mono uppercase font-black rounded-lg bg-[#FFFFFF] hover:bg-[#FEF3C7] text-[#121110] border border-[#D5CCC0] hover:border-[#F59E0B] transition-all active:scale-[0.96]"
                  >
                    MIN
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.5))}
                    className="flex-1 py-1.5 min-h-[34px] text-[10px] font-mono uppercase font-black rounded-lg bg-[#FFFFFF] hover:bg-[#FEF3C7] text-[#121110] border border-[#D5CCC0] hover:border-[#F59E0B] transition-all active:scale-[0.96]"
                  >
                    ½ POT
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.75))}
                    className="flex-1 py-1.5 min-h-[34px] text-[10px] font-mono uppercase font-black rounded-lg bg-[#FFFFFF] hover:bg-[#FEF3C7] text-[#121110] border border-[#D5CCC0] hover:border-[#F59E0B] transition-all active:scale-[0.96]"
                  >
                    ¾ POT
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(1.0))}
                    className="flex-1 py-1.5 min-h-[34px] text-[10px] font-mono uppercase font-black rounded-lg bg-[#FFFFFF] hover:bg-[#FEF3C7] text-[#121110] border border-[#D5CCC0] hover:border-[#F59E0B] transition-all active:scale-[0.96]"
                  >
                    POT
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('ALL_IN'))}
                    className="flex-1 py-1.5 min-h-[34px] text-[10px] font-mono uppercase font-black rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#F59E0B] transition-all active:scale-[0.96]"
                  >
                    ALL-IN
                  </button>
                </div>

                {/* Slider + Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustBet(-tableState.config.bigBlind)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE3D6] text-[#121110] active:scale-[0.95] border border-[#D5CCC0]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min={minTargetBet}
                    max={maxTargetBet}
                    step={tableState.config.smallBlind}
                    value={betAmount}
                    onChange={handleSliderChange}
                    className="flex-1 cursor-pointer"
                  />

                  <button
                    onClick={() => adjustBet(tableState.config.bigBlind)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EAE3D6] text-[#121110] active:scale-[0.95] border border-[#D5CCC0]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <span className="tabular-nums font-mono text-sm font-black text-[#92400E] min-w-[55px] text-right">
                    {betAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Tactile Keycap Buttons Row with 2px Bottom Lip */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* "Big Time" Button */}
              {isMyTurn && timeBank > 0 && (
                <button
                  onClick={handleBigTimeClick}
                  className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] border border-[#A855F7] border-b-2 border-b-[#7E22CE] text-xs font-mono font-black tracking-wider uppercase transition-all duration-120 active:translate-y-[2px] active:border-b-0 shadow-sm cursor-pointer"
                  title="Burn Time Bank reserve for +30s"
                >
                  <Clock className="w-4 h-4 animate-pulse text-[#6B21A8]" />
                  <span>BIG TIME</span>
                  <span className="text-[10px] font-bold">({timeBank}s)</span>
                </button>
              )}

              {/* Fold Keycap */}
              <button
                disabled={!isMyTurn}
                onClick={() => handleActionClick('fold')}
                className={`flex-1 sm:flex-none px-5 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-120 active:translate-y-[2px] border ${
                  isMyTurn
                    ? 'bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border-[#EF4444] border-b-2 border-b-[#B91C1C] shadow-sm cursor-pointer'
                    : 'bg-[#F7F4EE] text-[#A89882] border-[#D5CCC0] cursor-not-allowed opacity-60'
                }`}
              >
                FOLD
              </button>

              {/* Check or Call Keycap */}
              {canCheck ? (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('check')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-120 active:translate-y-[2px] border ${
                    isMyTurn
                      ? 'bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] border-[#22C55E] border-b-2 border-b-[#15803D] shadow-sm cursor-pointer'
                      : 'bg-[#F7F4EE] text-[#A89882] border-[#D5CCC0] cursor-not-allowed opacity-60'
                  }`}
                >
                  CHECK
                </button>
              ) : (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('call')}
                  className={`flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-120 active:translate-y-[2px] border flex items-center justify-center gap-1.5 ${
                    isMyTurn
                      ? 'bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E40AF] border-[#3B82F6] border-b-2 border-b-[#1D4ED8] shadow-sm cursor-pointer'
                      : 'bg-[#F7F4EE] text-[#A89882] border-[#D5CCC0] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>CALL</span>
                  <span className="tabular-nums font-black text-[#1E40AF]">
                    {Math.min(myPlayer.chips, toCall).toLocaleString()}
                  </span>
                </button>
              )}

              {/* Bet or Raise Keycap */}
              {myPlayer.chips > toCall && (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('raise', betAmount)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-120 active:translate-y-[2px] border flex items-center justify-center gap-1.5 ${
                    isMyTurn
                      ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#F59E0B] border-b-2 border-b-[#B45309] shadow-sm cursor-pointer'
                      : 'bg-[#F7F4EE] text-[#A89882] border-[#D5CCC0] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{currentBet === 0 ? 'BET' : 'RAISE'}</span>
                  <span className="tabular-nums font-black">
                    {betAmount.toLocaleString()}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
