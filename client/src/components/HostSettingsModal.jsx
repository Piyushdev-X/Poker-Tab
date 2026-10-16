// client/src/components/HostSettingsModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sliders, Shield } from 'lucide-react';

export default function HostSettingsModal({
  isOpen,
  onClose,
  config,
  onSave
}) {
  if (!config) return null;

  const [smallBlind, setSmallBlind] = useState(config.smallBlind || 10);
  const [bigBlind, setBigBlind] = useState(config.bigBlind || 20);
  const [turnTimeLimit, setTurnTimeLimit] = useState(config.turnTimeLimit || 20);
  const [timeBankReserve, setTimeBankReserve] = useState(config.timeBankReserve || 30);
  const [teamMode, setTeamMode] = useState(config.teamMode !== undefined ? config.teamMode : true);
  const [teammateSweatMode, setTeammateSweatMode] = useState(config.teammateSweatMode !== undefined ? config.teammateSweatMode : true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      smallBlind,
      bigBlind,
      turnTimeLimit,
      timeBankReserve,
      teamMode,
      teammateSweatMode
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-obsidian-surface border border-white/10 rounded-2xl p-6 shadow-2xl z-50 select-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brass" />
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Table Host Controls
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-obsidian-raised text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Small Blind
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(parseInt(e.target.value) || 1)}
                    className="w-full bg-obsidian-deep border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Big Blind
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={bigBlind}
                    onChange={(e) => setBigBlind(parseInt(e.target.value) || 2)}
                    className="w-full bg-obsidian-deep border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-brass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Turn Timer (s)
                  </label>
                  <select
                    value={turnTimeLimit}
                    onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                    className="w-full bg-obsidian-deep border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-brass"
                  >
                    <option value={15}>15s (Fast)</option>
                    <option value={20}>20s (Standard)</option>
                    <option value={30}>30s (Deep)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Time Bank (s)
                  </label>
                  <select
                    value={timeBankReserve}
                    onChange={(e) => setTimeBankReserve(parseInt(e.target.value))}
                    className="w-full bg-obsidian-deep border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-brass"
                  >
                    <option value={20}>+20s</option>
                    <option value={30}>+30s</option>
                    <option value={60}>+60s</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-deep border border-white/5">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Teammate Sweat Mode
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Ghost-view active teammates' hole cards
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTeammateSweatMode(!teammateSweatMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    teammateSweatMode ? 'bg-brass' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-obsidian transition-transform ${
                      teammateSweatMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brass hover:bg-brass-light text-obsidian text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Table Rules</span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
