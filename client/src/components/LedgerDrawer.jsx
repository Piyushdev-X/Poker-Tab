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
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet: Creamy Parchment */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#FAF7F2] border-l border-[#E2D9C8] shadow-clay-ambient z-50 flex flex-col p-5 sm:p-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2D9C8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAE2D3] border border-[#DCD2C0] flex items-center justify-center text-[#8C4A1D] font-bold shadow-xs">
                  $
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2C2623] font-display">
                    Poker Tab Ledger
                  </h2>
                  <p className="text-xs text-[#6E6259] font-mono">
                    Room {roomCode} • Live Accounting & Settlement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLedger}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-white border border-[#E2D9C8] text-[#6E6259] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
                  title="Refresh Ledger"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-white border border-[#E2D9C8] text-[#6E6259] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Macro Totals Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#EAE2D3]/60 border border-[#DCD2C0] p-3 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6259]">Total Buy-Ins</span>
                  <div className="tabular-nums font-mono font-bold text-lg text-[#2C2623] mt-0.5">
                    {ledger?.totalBuyIns?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-[#EAE2D3]/60 border border-[#DCD2C0] p-3 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6259]">Chips on Felt</span>
                  <div className="tabular-nums font-mono font-bold text-lg text-[#8C4A1D] mt-0.5">
                    {ledger?.totalChipsOnTable?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Player Accounting Table */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6E6259] mb-2">
                  Player Stacks & P&L
                </h3>
                <div className="bg-[#FAF7F2] rounded-xl border border-[#E2D9C8] overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2D9C8] text-[10px] font-mono uppercase text-[#6E6259] bg-[#EAE2D3]/50">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3 text-right">Invested</th>
                        <th className="py-2.5 px-3 text-right">Current</th>
                        <th className="py-2.5 px-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D9C8] text-xs font-mono">
                      {ledger?.players?.map((p) => {
                        const isMe = p.playerId === myPlayerId;
                        return (
                          <tr key={p.playerId} className={`hover:bg-[#EAE2D3]/30 ${isMe ? 'bg-[#FDF3D7]/60' : ''}`}>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[#2C2623] truncate max-w-[100px]">{p.name}</span>
                                {isMe && <span className="text-[9px] text-[#9E7223] font-bold">(You)</span>}
                                {p.team && (
                                  <span className="text-[8px] px-1 rounded uppercase font-bold text-[#6E6259] bg-[#EAE2D3] border border-[#DCD2C0]">
                                    {p.team}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums text-[#6E6259]">
                              {p.buyIn.toLocaleString()}
                              {p.rebuys > 0 && <span className="text-[9px] text-[#8C4A1D] ml-1 font-bold">({p.rebuys}R)</span>}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums font-bold text-[#2C2623]">
                              {p.currentChips.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums font-bold">
                              <span className={p.netPnL >= 0 ? 'text-[#5E9472]' : 'text-[#D96B6B]'}>
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
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6E6259] mb-2 flex items-center justify-between">
                  <span>Automated Session Settlements</span>
                  <span className="text-[10px] text-[#9E7223] font-bold">Min-Transaction Netting</span>
                </h3>

                {ledger?.settlements && ledger.settlements.length > 0 ? (
                  <div className="space-y-2">
                    {ledger.settlements.map((tx, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] text-xs font-mono shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#D96B6B]">{tx.from}</span>
                          <span className="text-[9px] px-1 rounded bg-[#EAE2D3] text-[#6E6259]">
                            {tx.fromTeam}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#8C4A1D]">
                          <ArrowRight className="w-3.5 h-3.5 text-[#9A8E84]" />
                          <span className="tabular-nums font-bold">{tx.amount.toLocaleString()}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#9A8E84]" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#5E9472]">{tx.to}</span>
                          <span className="text-[9px] px-1 rounded bg-[#EAE2D3] text-[#6E6259]">
                            {tx.toTeam}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#EAE2D3]/40 border border-[#DCD2C0] text-center text-xs font-mono text-[#6E6259] flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#5E9472]" />
                    All chip stacks and buy-ins currently in balance.
                  </div>
                )}
              </div>

              {/* Rebuy Section */}
              <div className="p-4 rounded-xl bg-[#EAE2D3]/60 border border-[#DCD2C0] shadow-xs">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2C2623] mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#8C4A1D]" />
                  Table Re-Buy & Top-Up
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rebuyAmount}
                    onChange={(e) => setRebuyAmount(parseInt(e.target.value) || 0)}
                    step="500"
                    min="500"
                    className="flex-1 bg-[#FAF7F2] border border-[#DCD2C0] rounded-lg px-3 py-2 text-xs font-mono text-[#2C2623] focus:outline-none focus:border-[#8C4A1D]"
                  />
                  <button
                    onClick={() => onRebuy(rebuyAmount)}
                    className="px-4 py-2 rounded-lg bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border border-[#E3B48D] border-b-2 border-b-[#CFA992] text-xs font-mono font-bold uppercase tracking-wider transition-all active:translate-y-[1px] cursor-pointer"
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
