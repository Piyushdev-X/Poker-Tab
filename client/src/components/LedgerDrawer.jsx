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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet: Crisp Porcelain & Editorial Linen */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#FFFFFF] border-l-2 border-[#D5CCC0] shadow-2xl z-50 flex flex-col p-5 sm:p-6 overflow-hidden select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D5CCC0]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#121110] text-[#FAF8F5] flex items-center justify-center font-black shadow-xs">
                  $
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#121110] font-display">
                    PokerTab Ledger
                  </h2>
                  <p className="text-xs text-[#4A443E] font-mono font-bold">
                    Room {roomCode} • Live Financial Accounting
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLedger}
                  disabled={loading}
                  className="p-2 rounded-lg bg-[#F7F4EE] hover:bg-[#EAE3D6] border border-[#D5CCC0] text-[#121110] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
                  title="Refresh Ledger"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-[#F7F4EE] hover:bg-[#EAE3D6] border border-[#D5CCC0] text-[#121110] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Macro Totals Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F7F4EE] border border-[#D5CCC0] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E645A] font-black">TOTAL BUY-INS</span>
                  <div className="tabular-nums font-mono font-black text-xl text-[#121110] mt-0.5">
                    {ledger?.totalBuyIns?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-[#F7F4EE] border border-[#D5CCC0] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E645A] font-black">CHIPS ON FELT</span>
                  <div className="tabular-nums font-mono font-black text-xl text-[#92400E] mt-0.5">
                    {ledger?.totalChipsOnTable?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Player Accounting Table */}
              <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#121110] mb-2">
                  PLAYER STACKS & NET P&L
                </h3>
                <div className="bg-[#FFFFFF] rounded-xl border border-[#D5CCC0] overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#D5CCC0] text-[10px] font-mono uppercase font-black text-[#4A443E] bg-[#F7F4EE]">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3 text-right">Invested</th>
                        <th className="py-2.5 px-3 text-right">Current</th>
                        <th className="py-2.5 px-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5CCC0] text-xs font-mono">
                      {ledger?.players?.map((p) => {
                        const isMe = p.playerId === myPlayerId;
                        return (
                          <tr key={p.playerId} className={`hover:bg-[#F7F4EE] ${isMe ? 'bg-[#FEF3C7]/60' : ''}`}>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-[#121110] truncate max-w-[110px]">{p.name}</span>
                                {isMe && <span className="text-[9px] text-[#92400E] font-black">(You)</span>}
                                {p.team && (
                                  <span className="text-[8px] px-1.5 py-0.2 rounded uppercase font-black text-[#4A443E] bg-[#F7F4EE] border border-[#D5CCC0]">
                                    {p.team}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-[#4A443E] font-bold">
                              {p.buyIn.toLocaleString()}
                              {p.rebuys > 0 && <span className="text-[9px] text-[#92400E] ml-1 font-black">({p.rebuys}R)</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-black text-[#121110]">
                              {p.currentChips.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-black">
                              <span className={p.netPnL >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}>
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
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#121110] mb-2 flex items-center justify-between">
                  <span>SESSION SETTLEMENTS</span>
                  <span className="text-[10px] text-[#92400E] font-black">MIN-TRANSACTION NETTING</span>
                </h3>

                {ledger?.settlements && ledger.settlements.length > 0 ? (
                  <div className="space-y-2">
                    {ledger.settlements.map((tx, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F7F4EE] border border-[#D5CCC0] text-xs font-mono shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#991B1B]">{tx.from}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#D5CCC0] text-[#4A443E] font-bold">
                            {tx.fromTeam}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#121110]">
                          <ArrowRight className="w-3.5 h-3.5 text-[#92400E]" />
                          <span className="tabular-nums font-black">{tx.amount.toLocaleString()}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#92400E]" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#166534]">{tx.to}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#D5CCC0] text-[#4A443E] font-bold">
                            {tx.toTeam}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#D5CCC0] text-center text-xs font-mono text-[#4A443E] flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-[#166534]" />
                    <span className="font-bold">All chip stacks and ledger entries are currently in balance.</span>
                  </div>
                )}
              </div>

              {/* Rebuy Section */}
              <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#D5CCC0] shadow-xs">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#121110] mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#92400E]" />
                  TABLE RE-BUY & TOP-UP
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rebuyAmount}
                    onChange={(e) => setRebuyAmount(parseInt(e.target.value) || 0)}
                    step="500"
                    min="500"
                    className="flex-1 bg-[#FFFFFF] border-2 border-[#D5CCC0] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#121110] focus:outline-none focus:border-[#92400E]"
                  />
                  <button
                    onClick={() => onRebuy(rebuyAmount)}
                    className="px-5 py-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#F59E0B] border-b-2 border-b-[#B45309] text-xs font-mono font-black uppercase tracking-wider transition-all active:translate-y-[1px] cursor-pointer"
                  >
                    BUY CHIPS
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
