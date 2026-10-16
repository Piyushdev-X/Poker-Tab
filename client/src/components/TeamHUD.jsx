// client/src/components/TeamHUD.jsx
import React, { useState } from 'react';
import { Shield, Copy, Check, BookOpen, MessageSquare, Volume2, VolumeX, LogOut, Settings } from 'lucide-react';
import { sounds } from '../audio';

export default function TeamHUD({
  roomCode,
  config,
  teamBankrolls,
  onOpenLedger,
  onOpenChat,
  onOpenSettings,
  onLeaveRoom,
  isHost = false
}) {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="w-full bg-obsidian-surface/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-30">
      {/* Left: Brand & Room Code Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brass to-brass-dark flex items-center justify-center font-bold text-obsidian text-sm shadow-md">
            ♠
          </div>
          <span className="font-display font-extrabold text-base tracking-wider text-slate-100 hidden sm:inline">
            POKERTAB
          </span>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian-raised border border-white/10 hover:border-brass/50 text-slate-300 hover:text-white transition-all text-xs font-mono active:scale-[0.96]"
          title="Click to copy Room Code"
        >
          <span className="text-[10px] text-slate-500 uppercase font-bold">Room</span>
          <span className="font-extrabold tracking-wider text-brass">{roomCode}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Blinds Telemetry */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-obsidian-deep/60 px-2 py-1 rounded-lg border border-white/5">
          <span className="text-[10px] uppercase text-slate-500">Blinds</span>
          <span className="tabular-nums font-bold text-slate-200">
            {config?.smallBlind || 10}/{config?.bigBlind || 20}
          </span>
        </div>
      </div>

      {/* Center: Team Mode Bankrolls Telemetry */}
      {config?.teamMode && teamBankrolls && (
        <div className="hidden lg:flex items-center gap-2">
          {/* Team Alpha */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/20 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/80 font-bold">
                Alpha ({teamBankrolls.ALPHA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-slate-200">
                  {teamBankrolls.ALPHA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.ALPHA?.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {teamBankrolls.ALPHA?.pnl >= 0 ? `+${teamBankrolls.ALPHA.pnl}` : teamBankrolls.ALPHA?.pnl}
                </span>
              </div>
            </div>
          </div>

          {/* Team Omega */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/20 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400/80 font-bold">
                Omega ({teamBankrolls.OMEGA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-slate-200">
                  {teamBankrolls.OMEGA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.OMEGA?.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {teamBankrolls.OMEGA?.pnl >= 0 ? `+${teamBankrolls.OMEGA.pnl}` : teamBankrolls.OMEGA?.pnl}
                </span>
              </div>
            </div>
          </div>

          {/* Team Sigma */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-950/20 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400/80 font-bold">
                Sigma ({teamBankrolls.SIGMA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-slate-200">
                  {teamBankrolls.SIGMA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.SIGMA?.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {teamBankrolls.SIGMA?.pnl >= 0 ? `+${teamBankrolls.SIGMA.pnl}` : teamBankrolls.SIGMA?.pnl}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2">
        {/* Ledger Drawer Toggle */}
        <button
          onClick={onOpenLedger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 hover:border-brass/40 text-slate-200 text-xs font-mono transition-all active:scale-[0.96]"
          title="Open Buy-In & Settlement Ledger"
        >
          <BookOpen className="w-3.5 h-3.5 text-brass" />
          <span className="hidden sm:inline">Poker Tab</span>
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono transition-all active:scale-[0.96]"
          title="Open Table & Team Comms"
        >
          <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Comms</span>
        </button>

        {/* Host Settings */}
        {isHost && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
            title="Room Host Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-[0.96]"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Leave Room */}
        <button
          onClick={onLeaveRoom}
          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 transition-all active:scale-[0.96]"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
