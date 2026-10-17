// client/src/components/TeamHUD.jsx
import React, { useState } from 'react';
import { Copy, Check, BookOpen, MessageSquare, Volume2, VolumeX, LogOut, Settings, MoreHorizontal } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="w-full bg-[#FFFFFF]/98 border-b border-[#D5CCC0] z-30 shadow-xs select-none max-w-[100vw] overflow-visible">
      {/* Row 1: Compact h-11 bar on mobile, standard on desktop */}
      <div className="max-w-7xl mx-auto h-11 md:h-13 px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left: Spade + Room Code + Blinds */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Spade Logo */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-[#121110] text-[#F7F4EE] flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
            ♠
          </div>

          <div className="hidden lg:flex flex-col leading-none">
            <span className="font-display font-black text-xs tracking-widest text-[#121110]">
              POKERTAB
            </span>
          </div>

          {/* Room Code Pill */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] hover:border-[#92400E] text-[#121110] transition-all text-[11px] font-mono font-bold active:scale-[0.97] cursor-pointer shadow-xs shrink-0"
            title="Click to copy Room Code"
          >
            <span className="text-[9px] text-[#6E645A] uppercase font-black">ROOM</span>
            <span className="tracking-wider text-[#121110]">{roomCode}</span>
            {copied ? (
              <Check className="w-3 h-3 text-[#166534]" />
            ) : (
              <Copy className="w-3 h-3 text-[#6E645A]" />
            )}
          </button>

          {/* Blinds Pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F7F4EE] border border-[#D5CCC0] text-[11px] font-mono font-bold text-[#121110] shrink-0">
            <span className="tabular-nums">
              {config?.smallBlind || 10}/{config?.bigBlind || 20}
            </span>
          </div>
        </div>

        {/* Right: Ledger, Chat, and ••• More Menu */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {/* Ledger Button */}
          <button
            onClick={onOpenLedger}
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            title="Open Ledger"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#92400E]" />
            <span className="hidden sm:inline">Ledger</span>
          </button>

          {/* Chat Button */}
          <button
            onClick={onOpenChat}
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#121110] text-xs font-mono font-bold transition-all active:scale-[0.97] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            title="Open Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Desktop inline utilities */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#991B1B]" /> : <Volume2 className="w-4 h-4 text-[#166534]" />}
            </button>
            {isHost && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D5CCC0] text-[#6E645A] hover:text-[#121110] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
                title="Host Settings"
              >
                <Settings className="w-4 h-4 text-[#92400E]" />
              </button>
            )}
            <button
              onClick={onLeaveRoom}
              className="p-1.5 rounded-lg bg-[#FEE2E2] hover:bg-[#FCA5A5] border border-[#F87171] text-[#991B1B] transition-all active:scale-[0.97] shadow-xs cursor-pointer"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile ••• More Menu Trigger */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`w-8 h-8 rounded-lg border border-[#D5CCC0] flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isMenuOpen ? 'bg-[#121110] text-[#FAF8F5]' : 'bg-[#FFFFFF] text-[#121110]'
              }`}
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu Modal */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-44 bg-[#FFFFFF] border-2 border-[#121110] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 font-mono text-xs">
                  <button
                    onClick={() => { handleToggleSound(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F7F4EE] text-[#121110] text-left cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-[#991B1B]" /> : <Volume2 className="w-4 h-4 text-[#166534]" />}
                    <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
                  </button>

                  {isHost && (
                    <button
                      onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F7F4EE] text-[#121110] text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#92400E]" />
                      <span>Host Settings</span>
                    </button>
                  )}

                  <div className="h-px bg-[#D5CCC0] my-0.5" />

                  <button
                    onClick={() => { onLeaveRoom(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#FEE2E2]/60 hover:bg-[#FEE2E2] text-[#991B1B] text-left font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#991B1B]" />
                    <span>Leave Room</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Ultra-Slim Team Score Strip (h-7 on mobile, inline segmented bar) */}
      {config?.teamMode && teamBankrolls && (
        <div className="w-full bg-[#EAE4D7]/90 border-t border-[#D6CFC2] py-1 px-3 text-[11px] font-mono font-bold flex items-center justify-around overflow-x-auto whitespace-nowrap">
          {/* Alpha */}
          <div className="flex items-center gap-1.5 text-[#92400E]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] font-black">ALPHA:</span>
            <span className="tabular-nums text-[#121110]">{teamBankrolls.ALPHA?.chips?.toLocaleString() || 0}</span>
          </div>

          <span className="text-[#C4B7A5]">|</span>

          {/* Omega */}
          <div className="flex items-center gap-1.5 text-[#1E40AF]">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[10px] font-black">OMEGA:</span>
            <span className="tabular-nums text-[#121110]">{teamBankrolls.OMEGA?.chips?.toLocaleString() || 0}</span>
          </div>

          <span className="text-[#C4B7A5]">|</span>

          {/* Sigma */}
          <div className="flex items-center gap-1.5 text-[#6B21A8]">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            <span className="text-[10px] font-black">SIGMA:</span>
            <span className="tabular-nums text-[#121110]">{teamBankrolls.SIGMA?.chips?.toLocaleString() || 0}</span>
          </div>
        </div>
      )}
    </header>
  );
}
