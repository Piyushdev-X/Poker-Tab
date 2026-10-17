// client/src/components/ActionDock.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Minus, Plus, Zap, AlertCircle } from 'lucide-react';
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

  return (
    <div className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 sm:px-4 z-40 pb-safe">
      <div className="relative bg-[#FAF7F2]/95 backdrop-blur-xl border border-[#E2D9C8] rounded-2xl p-2.5 sm:p-3.5 shadow-clay-ambient flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Hole Cards & Live Hand Telemetry */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center -space-x-3 sm:-space-x-4">
            {myPlayer.holeCards && myPlayer.holeCards.length === 2 ? (
              myPlayer.holeCards.map((c, i) => (
                <PlayingCard
                  key={`${c}-${i}`}
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
          </div>

          {/* Telemetry info badge */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#9A8E84]">Hand Strength</span>
              {tableState.liveTelemetry?.tier === 'nuts' && (
                <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-[#8C4A1D] bg-[#FBE5D2] px-1.5 py-0.2 rounded border border-[#E3B48D]">
                  <Flame className="w-2.5 h-2.5" /> High Equity
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm font-bold text-[#2C2623] flex items-center gap-1">
              {tableState.liveTelemetry?.strength || (isFolded ? 'Folded' : 'Waiting for Cards...')}
            </div>

            {tableState.liveTelemetry?.description && (
              <div className="text-[10px] sm:text-[11px] text-[#6E6259] font-mono">
                {tableState.liveTelemetry.description}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Section: Controls & Action Triggers */}
        {isFolded ? (
          <div className="text-xs sm:text-sm font-mono text-[#9A8E84] py-2 sm:py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#9A8E84]" />
            Folded this hand — observing table telemetry
          </div>
        ) : isAllIn ? (
          <div className="text-xs sm:text-sm font-mono font-bold text-[#8C4A1D] py-2 sm:py-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            All-In ({myPlayer.chips + myStreetBet} total) — awaiting street runout
          </div>
        ) : (
          <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-2">
            {/* Quick-sizing pills + Bet Slider */}
            {isMyTurn && myPlayer.chips > toCall && (
              <div className="flex flex-col w-full md:w-80 gap-1.5 bg-[#EAE2D3]/70 p-2 rounded-xl border border-[#DCD2C0]">
                {/* Pills */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('MIN'))}
                    className="flex-1 py-1 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] hover:text-[#2C2623] border border-[#DCD2C0] transition-all active:scale-[0.96]"
                  >
                    Min
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.5))}
                    className="flex-1 py-1 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] hover:text-[#2C2623] border border-[#DCD2C0] transition-all active:scale-[0.96]"
                  >
                    ½ Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.75))}
                    className="flex-1 py-1 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] hover:text-[#2C2623] border border-[#DCD2C0] transition-all active:scale-[0.96]"
                  >
                    ¾ Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(1.0))}
                    className="flex-1 py-1 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] hover:text-[#2C2623] border border-[#DCD2C0] transition-all active:scale-[0.96]"
                  >
                    Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('ALL_IN'))}
                    className="flex-1 py-1 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border border-[#E3B48D] transition-all active:scale-[0.96] font-bold"
                  >
                    Max
                  </button>
                </div>

                {/* Slider + Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustBet(-tableState.config.bigBlind)}
                    className="p-1 rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] active:scale-[0.95] border border-[#DCD2C0]"
                  >
                    <Minus className="w-3 h-3" />
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
                    className="p-1 rounded bg-[#FAF7F2] hover:bg-white text-[#6E6259] active:scale-[0.95] border border-[#DCD2C0]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <span className="tabular-nums font-mono text-xs font-bold text-[#8C4A1D] min-w-[50px] text-right">
                    {betAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons Row with Tactile Matte Keycaps (2px bottom lip) */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end">
              {/* "Big Time" Button */}
              {isMyTurn && timeBank > 0 && (
                <button
                  onClick={handleBigTimeClick}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-[#F0E4F5] hover:bg-[#E4D1EC] text-[#6E4482] border border-[#D9BBE6] border-b-2 border-b-[#C499D9] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 active:translate-y-[1px] active:border-b shadow-sm"
                  title="Burn Time Bank reserve for +30s"
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse text-[#6E4482]" />
                  <span>Big Time</span>
                  <span className="text-[9px] opacity-75">({timeBank}s)</span>
                </button>
              )}

              {/* Fold: Dusty Rose Pastel */}
              <button
                disabled={!isMyTurn}
                onClick={() => handleActionClick('fold')}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 active:translate-y-[1px] border ${
                  isMyTurn
                    ? 'bg-[#F7E2E2] hover:bg-[#F2D0D0] text-[#8C3B3B] border-[#DFAFAF] border-b-2 border-b-[#DFAFAF] shadow-sm cursor-pointer'
                    : 'bg-[#EAE2D3]/40 text-[#9A8E84] border-[#DCD2C0]/50 cursor-not-allowed opacity-50'
                }`}
              >
                Fold
              </button>

              {/* Check or Call: Soft Mint Sage */}
              {canCheck ? (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('check')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 active:translate-y-[1px] border ${
                    isMyTurn
                      ? 'bg-[#DFF0E4] hover:bg-[#CDE6D5] text-[#2B6340] border-[#A8D1B5] border-b-2 border-b-[#A8D1B5] shadow-sm cursor-pointer'
                      : 'bg-[#EAE2D3]/40 text-[#9A8E84] border-[#DCD2C0]/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  Check
                </button>
              ) : (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('call')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 active:translate-y-[1px] border flex items-center justify-center gap-1 sm:gap-1.5 ${
                    isMyTurn
                      ? 'bg-[#E6F0FA] hover:bg-[#D5E6F7] text-[#36638F] border-[#B3D1F0] border-b-2 border-b-[#B3D1F0] shadow-sm cursor-pointer'
                      : 'bg-[#EAE2D3]/40 text-[#9A8E84] border-[#DCD2C0]/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Call</span>
                  <span className="tabular-nums font-extrabold text-[#36638F]">
                    {Math.min(myPlayer.chips, toCall).toLocaleString()}
                  </span>
                </button>
              )}

              {/* Bet or Raise: Warm Peach / Terracotta Pastel */}
              {myPlayer.chips > toCall && (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('raise', betAmount)}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 active:translate-y-[1px] border flex items-center justify-center gap-1 sm:gap-1.5 ${
                    isMyTurn
                      ? 'bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border-[#E3B48D] border-b-2 border-b-[#E3B48D] shadow-sm cursor-pointer'
                      : 'bg-[#EAE2D3]/40 text-[#9A8E84] border-[#DCD2C0]/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{currentBet === 0 ? 'Bet' : 'Raise'}</span>
                  <span className="tabular-nums font-extrabold">
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
