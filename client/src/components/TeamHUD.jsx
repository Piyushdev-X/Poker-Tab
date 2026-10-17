// client/src/components/TeamHUD.jsx
import React, { useState } from 'react';
import { Copy, Check, BookOpen, MessageSquare, Volume2, VolumeX, LogOut, Settings } from 'lucide-react';
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
    <header className="w-full bg-[#FFFFFF]/98 backdrop-blur-md border-b-2 border-[#D5CCC0] px-2.5 sm:px-6 py-2 z-30 shadow-xs select-none max-w-[100vw] overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-4 w-full">
        
        {/* Mobile Row 1 / Desktop Left & Right: Vital Telemetry & Actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-1 sm:gap-3">
          {/* Brand & Room Info */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Compact Spade Logo */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-[#121110] text-[#F7F4EE] flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
              ♠
            </div>

            <div className="hidden lg:flex flex-col">
              <span className="font-display font-black text-xs tracking-widest text-[#121110] leading-none">
                POKERTAB
              </span>
              <span className="text-[8px] font-mono tracking-wider text-[#6E645A] font-bold">
                HIGH CRAFT
              </span>
            </div>

            {/* Room Code Pill */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] hover:border-[#92400E] text-[#121110] transition-all text-[11px] sm:text-xs font-mono active:scale-[0.97] cursor-pointer shadow-xs shrink-0"
              title="Click to copy Room Code"
            >
              <span className="text-[9px] text-[#6E645A] uppercase font-black">ROOM</span>
              <span className="font-black tracking-wider text-[#121110]">{roomCode}</span>
              {copied ? (
                <Check className="w-3 h-3 text-[#166534]" />
              ) : (
                <Copy className="w-3 h-3 text-[#6E645A]" />
              )}
            </button>

            {/* Blinds Telemetry */}
            <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] text-[11px] sm:text-xs font-mono text-[#121110] shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-[#6E645A] font-bold hidden xs:inline">BLINDS</span>
              <span className="tabular-nums font-black text-[#121110]">
                {config?.smallBlind || 10}/{config?.bigBlind || 20}
              </span>
            </div>
          </div>

          {/* Right Action Buttons (Compact on Mobile: Fits inside 375px with zero overflow) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Ledger Toggle */}
            <button
              onClick={onOpenLedger}
              className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              title="Ledger"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
              <span className="hidden sm:inline">Ledger</span>
            </button>

            {/* Chat Toggle */}
            <button
              onClick={onOpenChat}
              className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              title="Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={handleToggleSound}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs flex items-center justify-center cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#991B1B]" /> : <Volume2 className="w-3.5 h-3.5 text-[#166534]" />}
            </button>

            {/* Host Settings */}
            {isHost && (
              <button
                onClick={onOpenSettings}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs flex items-center justify-center cursor-pointer"
                title="Host Settings"
              >
                <Settings className="w-3.5 h-3.5 text-[#92400E]" />
              </button>
            )}

            {/* Leave Room Button */}
            <button
              onClick={onLeaveRoom}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FEE2E2] hover:bg-[#FCA5A5] border border-[#F87171] text-[#991B1B] transition-all active:scale-[0.97] shadow-xs flex items-center justify-center cursor-pointer"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Team Scoreboards (3-Column Grid on Mobile, Always Visible) */}
        {config?.teamMode && teamBankrolls && (
          <div className="grid grid-cols-3 gap-1.5 w-full md:w-auto md:flex md:items-center md:gap-2.5">
            {/* Team Alpha */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FEF3C7] border border-[#F59E0B] shadow-xs justify-between md:justify-start">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#92400E] font-black truncate">
                  ALPHA
                </span>
                <span className="tabular-nums font-mono text-[10px] sm:text-xs font-black text-[#121110] truncate">
                  {teamBankrolls.ALPHA?.chips?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Team Omega */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#DBEAFE] border border-[#3B82F6] shadow-xs justify-between md:justify-start">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#1E40AF] font-black truncate">
                  OMEGA
                </span>
                <span className="tabular-nums font-mono text-[10px] sm:text-xs font-black text-[#121110] truncate">
                  {teamBankrolls.OMEGA?.chips?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Team Sigma */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F3E8FF] border border-[#A855F7] shadow-xs justify-between md:justify-start">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] shrink-0" />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#6E645A] font-black truncate">
                  SIGMA
                </span>
                <span className="tabular-nums font-mono text-[10px] sm:text-xs font-black text-[#121110] truncate">
                  {teamBankrolls.SIGMA?.chips?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
