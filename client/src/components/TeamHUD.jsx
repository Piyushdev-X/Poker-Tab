// client/src/components/TeamHUD.jsx
import React, { useState } from 'react';
import { Copy, Check, BookOpen, MessageSquare, Volume2, VolumeX, LogOut, Settings, Shield } from 'lucide-react';
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
    <header className="w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b-2 border-[#D5CCC0] px-3 sm:px-6 py-2 sm:py-2.5 z-30 shadow-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Brand & Vital Table Parameters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#121110] text-[#F7F4EE] flex items-center justify-center font-bold text-sm sm:text-base shadow-sm">
              ♠
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-black text-sm tracking-widest text-[#121110] leading-none">
                POKERTAB
              </span>
              <span className="text-[9px] font-mono tracking-wider text-[#6E645A] font-bold">
                HIGH CRAFT LEDGER
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-[#D5CCC0] hidden sm:block" />

          {/* Room Code Bento Pill */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] hover:border-[#92400E] text-[#121110] transition-all text-xs font-mono active:scale-[0.97] cursor-pointer shadow-xs"
            title="Click to copy Room Code"
          >
            <span className="text-[9px] text-[#6E645A] uppercase font-black tracking-wider">ROOM</span>
            <span className="font-black tracking-widest text-[#121110]">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#166534]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#6E645A]" />
            )}
          </button>

          {/* Blinds Telemetry */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] text-xs font-mono text-[#121110]">
            <span className="text-[9px] uppercase tracking-wider text-[#6E645A] font-bold">BLINDS</span>
            <span className="tabular-nums font-black text-[#121110]">
              {config?.smallBlind || 10}/{config?.bigBlind || 20}
            </span>
          </div>
        </div>

        {/* Center Section: High-Contrast Bento Team Scoreboards */}
        {config?.teamMode && teamBankrolls && (
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Team Alpha */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#92400E] font-black">
                    ALPHA
                  </span>
                  <span className="text-[8px] font-mono text-[#92400E] font-bold">
                    {teamBankrolls.ALPHA?.players || 0}P
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums font-mono text-xs sm:text-sm font-black text-[#121110]">
                    {teamBankrolls.ALPHA?.chips?.toLocaleString() || 0}
                  </span>
                  <span className={`text-[10px] font-mono font-black ${
                    (teamBankrolls.ALPHA?.pnl || 0) >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                  }`}>
                    {(teamBankrolls.ALPHA?.pnl || 0) >= 0 ? `+${teamBankrolls.ALPHA?.pnl || 0}` : teamBankrolls.ALPHA?.pnl}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Omega */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#DBEAFE] border border-[#3B82F6] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#1E40AF] font-black">
                    OMEGA
                  </span>
                  <span className="text-[8px] font-mono text-[#1E40AF] font-bold">
                    {teamBankrolls.OMEGA?.players || 0}P
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums font-mono text-xs sm:text-sm font-black text-[#121110]">
                    {teamBankrolls.OMEGA?.chips?.toLocaleString() || 0}
                  </span>
                  <span className={`text-[10px] font-mono font-black ${
                    (teamBankrolls.OMEGA?.pnl || 0) >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                  }`}>
                    {(teamBankrolls.OMEGA?.pnl || 0) >= 0 ? `+${teamBankrolls.OMEGA?.pnl || 0}` : teamBankrolls.OMEGA?.pnl}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Sigma */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3E8FF] border border-[#A855F7] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#6B21A8] font-black">
                    SIGMA
                  </span>
                  <span className="text-[8px] font-mono text-[#6B21A8] font-bold">
                    {teamBankrolls.SIGMA?.players || 0}P
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums font-mono text-xs sm:text-sm font-black text-[#121110]">
                    {teamBankrolls.SIGMA?.chips?.toLocaleString() || 0}
                  </span>
                  <span className={`text-[10px] font-mono font-black ${
                    (teamBankrolls.SIGMA?.pnl || 0) >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                  }`}>
                    {(teamBankrolls.SIGMA?.pnl || 0) >= 0 ? `+${teamBankrolls.SIGMA?.pnl || 0}` : teamBankrolls.SIGMA?.pnl}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Section: Bento Action Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ledger Toggle */}
          <button
            onClick={onOpenLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs cursor-pointer"
            title="Open Buy-In & Settlement Ledger"
          >
            <BookOpen className="w-4 h-4 text-[#92400E]" />
            <span className="hidden sm:inline">Ledger</span>
          </button>

          {/* Chat Toggle */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs cursor-pointer"
            title="Open Table Chat"
          >
            <MessageSquare className="w-4 h-4 text-[#1E40AF]" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#991B1B]" /> : <Volume2 className="w-4 h-4 text-[#166534]" />}
          </button>

          {/* Host Settings */}
          {isHost && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
              title="Host Settings"
            >
              <Settings className="w-4 h-4 text-[#92400E]" />
            </button>
          )}

          {/* Leave Room Button */}
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg bg-[#FEE2E2] hover:bg-[#FCA5A5] border border-[#F87171] text-[#991B1B] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
            title="Leave Table"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
