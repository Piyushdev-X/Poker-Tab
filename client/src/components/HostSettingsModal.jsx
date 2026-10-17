// client/src/components/HostSettingsModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sliders } from 'lucide-react';

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#FFFFFF] border-2 border-[#D5CCC0] rounded-2xl p-6 shadow-2xl z-50 select-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D5CCC0] mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#92400E]" />
                <h3 className="text-base font-black text-[#121110] font-display">
                  Table Host Controls
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#F7F4EE] hover:bg-[#EAE3D6] text-[#121110] border border-[#D5CCC0] shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#4A443E] block mb-1">
                    Small Blind
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#F7F4EE] border-2 border-[#D5CCC0] rounded-xl p-2.5 text-xs font-mono font-bold text-[#121110] focus:outline-none focus:border-[#92400E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#4A443E] block mb-1">
                    Big Blind
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={bigBlind}
                    onChange={(e) => setBigBlind(parseInt(e.target.value) || 2)}
                    className="w-full bg-[#F7F4EE] border-2 border-[#D5CCC0] rounded-xl p-2.5 text-xs font-mono font-bold text-[#121110] focus:outline-none focus:border-[#92400E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#4A443E] block mb-1">
                    Turn Timer (s)
                  </label>
                  <select
                    value={turnTimeLimit}
                    onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                    className="w-full bg-[#F7F4EE] border-2 border-[#D5CCC0] rounded-xl p-2.5 text-xs font-mono font-bold text-[#121110] focus:outline-none focus:border-[#92400E]"
                  >
                    <option value={10}>10s (Blitz)</option>
                    <option value={15}>15s (Fast)</option>
                    <option value={20}>20s (Standard)</option>
                    <option value={30}>30s (Deep)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#4A443E] block mb-1">
                    Big Time Bank (s)
                  </label>
                  <select
                    value={timeBankReserve}
                    onChange={(e) => setTimeBankReserve(parseInt(e.target.value))}
                    className="w-full bg-[#F7F4EE] border-2 border-[#D5CCC0] rounded-xl p-2.5 text-xs font-mono font-bold text-[#121110] focus:outline-none focus:border-[#92400E]"
                  >
                    <option value={15}>15s Reserve</option>
                    <option value={30}>30s Reserve</option>
                    <option value={60}>60s Reserve</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#D5CCC0]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamMode}
                    onChange={(e) => setTeamMode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#92400E] border-[#D5CCC0] focus:ring-0"
                  />
                  <span className="text-xs font-mono font-bold text-[#121110]">
                    Enable 3-Team Bankroll Mode (Alpha / Omega / Sigma)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teammateSweatMode}
                    onChange={(e) => setTeammateSweatMode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#92400E] border-[#D5CCC0] focus:ring-0"
                  />
                  <span className="text-xs font-mono font-bold text-[#121110]">
                    Teammate Sweat Mode (Ghost Hole Cards)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#121110] hover:bg-[#2C2623] text-[#FAF8F5] text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Table Parameters</span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
