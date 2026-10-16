// client/src/components/LedgerDrawer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowRight, DollarSign, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function LedgerDrawer({
  isOpen,
  onClose,
  roomCode,
  socket,
  myPlayerId,
  onRebuy
}) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rebuyAmount, setRebuyAmount] = useState(2000);

  const fetchLedger = () => {
    if (!socket || !roomCode) return;
    setLoading(true);
    socket.emit('GET_LEDGER', { roomCode }, (res) => {
      setLedger(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
    }
  }, [isOpen, roomCode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-obsidian-surface border-l border-white/10 shadow-2xl z-50 flex flex-col p-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brass/20 border border-brass/40 flex items-center justify-center text-brass font-bold">
                  $
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 font-display">
                    Poker Tab Ledger
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Room {roomCode} • Live Accounting & Settlement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLedger}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-300 transition-all active:scale-[0.95]"
                  title="Refresh Ledger"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-300 transition-all active:scale-[0.95]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              {/* Macro Totals Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-obsidian-deep/80 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Buy-Ins</span>
                  <div className="tabular-nums font-mono font-bold text-lg text-slate-100 mt-0.5">
                    {ledger?.totalBuyIns?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-obsidian-deep/80 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Chips on Felt</span>
                  <div className="tabular-nums font-mono font-bold text-lg text-brass-light mt-0.5">
                    {ledger?.totalChipsOnTable?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Player Accounting Table */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Player Stacks & P&L
                </h3>
                <div className="bg-obsidian-deep/60 rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-slate-400 bg-white/5">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3 text-right">Invested</th>
                        <th className="py-2.5 px-3 text-right">Current</th>
                        <th className="py-2.5 px-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-mono">
                      {ledger?.players?.map((p) => {
                        const isMe = p.playerId === myPlayerId;
                        return (
                          <tr key={p.playerId} className={`hover:bg-white/5 ${isMe ? 'bg-brass/5' : ''}`}>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-200 truncate max-w-[100px]">{p.name}</span>
                                {isMe && <span className="text-[9px] text-brass">(You)</span>}
                                {p.team && (
                                  <span className="text-[8px] px-1 rounded uppercase font-bold text-slate-400 bg-white/5 border border-white/10">
                                    {p.team}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums text-slate-400">
                              {p.buyIn.toLocaleString()}
                              {p.rebuys > 0 && <span className="text-[9px] text-amber-500 ml-1">({p.rebuys}R)</span>}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-200">
                              {p.currentChips.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums font-bold">
                              <span className={p.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {p.netPnL >= 0 ? `+${p.netPnL.toLocaleString()}` : p.netPnL.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlement Matrix (Debt Minimization Algorithm) */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Automated Session Settlements</span>
                  <span className="text-[10px] text-brass font-normal">Min-Transaction Netting</span>
                </h3>

                {ledger?.settlements && ledger.settlements.length > 0 ? (
                  <div className="space-y-2">
                    {ledger.settlements.map((tx, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-deep/80 border border-white/5 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-red-400">{tx.from}</span>
                          <span className="text-[9px] px-1 rounded bg-white/5 text-slate-400">
                            {tx.fromTeam}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-brass">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="tabular-nums font-bold">{tx.amount.toLocaleString()}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-400">{tx.to}</span>
                          <span className="text-[9px] px-1 rounded bg-white/5 text-slate-400">
                            {tx.toTeam}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-obsidian-deep/40 border border-white/5 text-center text-xs font-mono text-slate-500 flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    All chip stacks and buy-ins currently in balance.
                  </div>
                )}
              </div>

              {/* Rebuy Section */}
              <div className="p-4 rounded-xl bg-obsidian-deep/80 border border-white/5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-brass" />
                  Table Re-Buy & Top-Up
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rebuyAmount}
                    onChange={(e) => setRebuyAmount(parseInt(e.target.value) || 0)}
                    step="500"
                    min="500"
                    className="flex-1 bg-obsidian-surface border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-brass/60"
                  />
                  <button
                    onClick={() => onRebuy(rebuyAmount)}
                    className="px-4 py-2 rounded-lg bg-brass hover:bg-brass-light text-obsidian text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.96]"
                  >
                    Buy Chips
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
