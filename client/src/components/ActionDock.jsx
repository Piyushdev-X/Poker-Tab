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
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
      <div className="relative bg-obsidian-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Section: Hole Cards & Live Hand Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-4">
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Hand Strength</span>
              {tableState.liveTelemetry?.tier === 'nuts' && (
                <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                  <Flame className="w-2.5 h-2.5" /> High Equity
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-slate-100 flex items-center gap-1">
              {tableState.liveTelemetry?.strength || (isFolded ? 'Folded' : 'Waiting for Cards...')}
            </div>

            {tableState.liveTelemetry?.description && (
              <div className="text-[11px] text-slate-400 font-mono">
                {tableState.liveTelemetry.description}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Section: Controls & Action Triggers */}
        {isFolded ? (
          <div className="text-sm font-mono text-slate-500 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            Folded this hand — observing table telemetry
          </div>
        ) : isAllIn ? (
          <div className="text-sm font-mono font-bold text-amber-400 py-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            All-In ({myPlayer.chips + myStreetBet} total) — awaiting street runout
          </div>
        ) : (
          <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-2.5">
            {/* Quick-sizing pills + Bet Slider */}
            {isMyTurn && myPlayer.chips > toCall && (
              <div className="flex flex-col w-full md:w-80 gap-1.5 bg-obsidian-deep/80 p-2 rounded-xl border border-white/5">
                {/* Pills */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('MIN'))}
                    className="flex-1 py-1 text-[10px] font-mono uppercase rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
                  >
                    Min
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.5))}
                    className="flex-1 py-1 text-[10px] font-mono uppercase rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
                  >
                    ½ Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(0.75))}
                    className="flex-1 py-1 text-[10px] font-mono uppercase rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
                  >
                    ¾ Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize(1.0))}
                    className="flex-1 py-1 text-[10px] font-mono uppercase rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
                  >
                    Pot
                  </button>
                  <button
                    onClick={() => setBetAmount(calculateQuickSize('ALL_IN'))}
                    className="flex-1 py-1 text-[10px] font-mono uppercase rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-500/30 transition-all active:scale-[0.96]"
                  >
                    Max
                  </button>
                </div>

                {/* Slider + Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustBet(-tableState.config.bigBlind)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 active:scale-[0.95]"
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
                    className="flex-1 accent-brass cursor-pointer"
                  />

                  <button
                    onClick={() => adjustBet(tableState.config.bigBlind)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 active:scale-[0.95]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <span className="tabular-nums font-mono text-xs font-bold text-brass min-w-[50px] text-right">
                    {betAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* "Big Time" Button */}
              {isMyTurn && timeBank > 0 && (
                <button
                  onClick={handleBigTimeClick}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-200 text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 active:scale-[0.96] shadow-glow-bigtime"
                  title="Burn Time Bank reserve for +30s"
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Big Time</span>
                  <span className="text-[10px] opacity-75">({timeBank}s)</span>
                </button>
              )}

              {/* Fold */}
              <button
                disabled={!isMyTurn}
                onClick={() => handleActionClick('fold')}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] border ${
                  isMyTurn
                    ? 'bg-slate-900/90 hover:bg-slate-800 text-red-400 border-red-900/50 shadow-md cursor-pointer'
                    : 'bg-slate-900/30 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                }`}
              >
                Fold
              </button>

              {/* Check or Call */}
              {canCheck ? (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('check')}
                  className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] border ${
                    isMyTurn
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600 shadow-md cursor-pointer'
                      : 'bg-slate-900/30 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                  }`}
                >
                  Check
                </button>
              ) : (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('call')}
                  className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] border flex items-center gap-1.5 ${
                    isMyTurn
                      ? 'bg-sky-950/80 hover:bg-sky-900 text-sky-200 border-sky-600/50 shadow-md cursor-pointer'
                      : 'bg-slate-900/30 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Call</span>
                  <span className="tabular-nums font-extrabold text-sky-400">
                    {Math.min(myPlayer.chips, toCall).toLocaleString()}
                  </span>
                </button>
              )}

              {/* Bet or Raise */}
              {myPlayer.chips > toCall && (
                <button
                  disabled={!isMyTurn}
                  onClick={() => handleActionClick('raise', betAmount)}
                  className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] border flex items-center gap-1.5 ${
                    isMyTurn
                      ? 'bg-gradient-to-r from-brass to-brass-dark hover:from-brass-light hover:to-brass text-obsidian border-brass shadow-glow-active cursor-pointer'
                      : 'bg-slate-900/30 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
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
