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
    <header className="w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E2D9C8] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between z-30 shadow-xs">
      {/* Left: Brand & Room Code Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EAE2D3] border border-[#DCD2C0] flex items-center justify-center font-bold text-[#8C4A1D] text-xs sm:text-sm shadow-xs">
            ♠
          </div>
          <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-[#2C2623] hidden sm:inline">
            POKERTAB
          </span>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] hover:border-[#9E7223]/60 text-[#2C2623] transition-all text-xs font-mono active:scale-[0.96] shadow-xs cursor-pointer"
          title="Click to copy Room Code"
        >
          <span className="text-[9px] sm:text-[10px] text-[#9A8E84] uppercase font-bold">Room</span>
          <span className="font-extrabold tracking-wider text-[#8C4A1D]">{roomCode}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-[#5E9472]" /> : <Copy className="w-3.5 h-3.5 text-[#9A8E84]" />}
        </button>

        {/* Blinds Telemetry */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#6E6259] bg-[#EAE2D3]/60 px-2 py-1 rounded-lg border border-[#DCD2C0]">
          <span className="text-[10px] uppercase text-[#9A8E84]">Blinds</span>
          <span className="tabular-nums font-bold text-[#2C2623]">
            {config?.smallBlind || 10}/{config?.bigBlind || 20}
          </span>
        </div>
      </div>

      {/* Center: Team Mode Bankrolls Telemetry */}
      {config?.teamMode && teamBankrolls && (
        <div className="hidden lg:flex items-center gap-2">
          {/* Team Alpha */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FDF3D7] border border-[#F2D08B]">
            <span className="w-2 h-2 rounded-full bg-[#F5C76B]" />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono uppercase tracking-wider text-[#9E7223] font-bold">
                Alpha ({teamBankrolls.ALPHA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-[#2C2623]">
                  {teamBankrolls.ALPHA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.ALPHA?.pnl >= 0 ? 'text-[#5E9472]' : 'text-[#D96B6B]'
                }`}>
                  {teamBankrolls.ALPHA?.pnl >= 0 ? `+${teamBankrolls.ALPHA.pnl}` : teamBankrolls.ALPHA?.pnl}
                </span>
              </div>
            </div>
          </div>

          {/* Team Omega */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#E6F0FA] border border-[#B3D1F0]">
            <span className="w-2 h-2 rounded-full bg-[#89B9E8]" />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono uppercase tracking-wider text-[#36638F] font-bold">
                Omega ({teamBankrolls.OMEGA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-[#2C2623]">
                  {teamBankrolls.OMEGA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.OMEGA?.pnl >= 0 ? 'text-[#5E9472]' : 'text-[#D96B6B]'
                }`}>
                  {teamBankrolls.OMEGA?.pnl >= 0 ? `+${teamBankrolls.OMEGA.pnl}` : teamBankrolls.OMEGA?.pnl}
                </span>
              </div>
            </div>
          </div>

          {/* Team Sigma */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F3E8F7] border border-[#D9BBE6]">
            <span className="w-2 h-2 rounded-full bg-[#C499D9]" />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono uppercase tracking-wider text-[#6E4482] font-bold">
                Sigma ({teamBankrolls.SIGMA?.players || 0})
              </span>
              <div className="flex items-center gap-1">
                <span className="tabular-nums font-mono text-xs font-bold text-[#2C2623]">
                  {teamBankrolls.SIGMA?.chips?.toLocaleString() || 0}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  teamBankrolls.SIGMA?.pnl >= 0 ? 'text-[#5E9472]' : 'text-[#D96B6B]'
                }`}>
                  {teamBankrolls.SIGMA?.pnl >= 0 ? `+${teamBankrolls.SIGMA.pnl}` : teamBankrolls.SIGMA?.pnl}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Ledger Drawer Toggle */}
        <button
          onClick={onOpenLedger}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#E2D9C8] hover:border-[#9E7223]/50 text-[#2C2623] text-xs font-mono transition-all active:scale-[0.96] shadow-xs cursor-pointer"
          title="Open Buy-In & Settlement Ledger"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#9E7223]" />
          <span className="hidden sm:inline">Ledger</span>
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#E2D9C8] hover:border-[#36638F]/50 text-[#2C2623] text-xs font-mono transition-all active:scale-[0.96] shadow-xs cursor-pointer"
          title="Open Table & Team Comms"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#36638F]" />
          <span className="hidden sm:inline">Chat</span>
        </button>

        {/* Host Settings */}
        {isHost && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#E2D9C8] text-[#6E6259] hover:text-[#2C2623] transition-all active:scale-[0.96] shadow-xs cursor-pointer"
            title="Room Host Settings"
          >
            <Settings className="w-4 h-4 text-[#8C4A1D]" />
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 sm:p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#E2D9C8] text-[#6E6259] hover:text-[#2C2623] transition-all active:scale-[0.96] shadow-xs cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#D96B6B]" /> : <Volume2 className="w-4 h-4 text-[#6E6259]" />}
        </button>

        {/* Leave Room */}
        <button
          onClick={onLeaveRoom}
          className="p-1.5 sm:p-2 rounded-lg bg-[#FDF2F2] hover:bg-[#FBE5D2] border border-[#DFAFAF] text-[#8C3B3B] transition-all active:scale-[0.96] shadow-xs cursor-pointer"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
