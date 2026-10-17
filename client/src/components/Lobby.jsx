// client/src/components/Lobby.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Clock, Flame, Zap, ArrowRight, Play, RefreshCw } from 'lucide-react';

const TEAMS = [
  {
    id: 'ALPHA',
    name: 'Team Alpha',
    accent: 'border-[#F2D08B] text-[#9E7223] bg-[#FDF3D7]',
    dot: 'bg-[#F5C76B]',
    desc: 'Buttercup Apricot'
  },
  {
    id: 'OMEGA',
    name: 'Team Omega',
    accent: 'border-[#B3D1F0] text-[#36638F] bg-[#E6F0FA]',
    dot: 'bg-[#89B9E8]',
    desc: 'Periwinkle Sky'
  },
  {
    id: 'SIGMA',
    name: 'Team Sigma',
    accent: 'border-[#D9BBE6] text-[#6E4482] bg-[#F3E8F7]',
    dot: 'bg-[#C499D9]',
    desc: 'Lavender Lilac'
  }
];

const RANDOM_NAMES = [
  'Doyle', 'Ivey', 'Brunson', 'Maverick', 'Vegas_Kid',
  'River_King', 'FullHouse', 'HighRoller', 'ChipLeader', 'AceHigh'
];

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  initialName = '',
  loading = false,
  errorMessage = '',
  isConnected = true
}) {
  const [tab, setTab] = useState('CREATE'); // 'CREATE' or 'JOIN'
  const [playerName, setPlayerName] = useState(() => {
    if (initialName && initialName.trim()) return initialName.trim();
    const pick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    return `${pick}_${Math.floor(10 + Math.random() * 90)}`;
  });
  const [nameError, setNameError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALPHA');
  const [joinCode, setJoinCode] = useState('');

  // Host configuration state
  const [startingStack, setStartingStack] = useState(2000);
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [turnTimeLimit, setTurnTimeLimit] = useState(20);
  const [timeBankReserve, setTimeBankReserve] = useState(30);
  const [teamMode, setTeamMode] = useState(true);
  const [teammateSweatMode, setTeammateSweatMode] = useState(true);

  const handleRandomizeName = () => {
    const pick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const generated = `${pick}_${Math.floor(10 + Math.random() * 90)}`;
    setPlayerName(generated);
    setNameError('');
  };

  const handleCreate = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!playerName || !playerName.trim()) {
      setNameError('Please enter a player handle before launching');
      return;
    }
    setNameError('');

    onCreateRoom({
      name: playerName.trim(),
      team: teamMode ? selectedTeam : 'NONE',
      config: {
        maxSeats: 6,
        startingStack,
        smallBlind,
        bigBlind,
        turnTimeLimit,
        timeBankReserve,
        teamMode,
        teammateSweatMode
      }
    });
  };

  const handleJoin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!playerName || !playerName.trim()) {
      setNameError('Please enter a player handle first');
      return;
    }
    if (!joinCode || !joinCode.trim()) {
      setNameError('Please enter the 6-character room code');
      return;
    }
    setNameError('');

    onJoinRoom({
      roomCode: joinCode.trim().toUpperCase(),
      name: playerName.trim(),
      team: teamMode ? selectedTeam : 'NONE'
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      {/* Background Subtle Paper / Warm Noise Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(216,199,178,0.35),transparent_65%)] pointer-events-none" />

      {/* Main Container Card: Creamy Parchment */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-[#FAF7F2]/95 backdrop-blur-xl border border-[#E2D9C8] rounded-3xl p-5 sm:p-7 md:p-8 shadow-clay-ambient overflow-hidden"
      >
        {/* Card Header Brand */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EAE2D3] border border-[#DCD2C0] flex items-center justify-center text-[#8C4A1D] text-xl sm:text-2xl font-bold mb-2.5 shadow-card-tactile">
            ♠
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C2623] font-display">
            PokerTab
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#6E6259] mt-0.5">
            Warm Editorial Tabletop & Team Settlement Ledger
          </p>

          {/* Connection status badge */}
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE2D3]/60 border border-[#DCD2C0]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#5E9472]' : 'bg-[#D96B6B] animate-pulse'}`} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6259]">
              {isConnected ? 'Engine Online' : 'Connecting Engine...'}
            </span>
          </div>
        </div>

        {/* Error Alert if any */}
        {(errorMessage || nameError) && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDF2F2] border border-[#DFAFAF] text-[#8C3B3B] text-xs font-mono flex items-center justify-between">
            <span>{errorMessage || nameError}</span>
            {nameError && (
              <button
                type="button"
                onClick={() => setNameError('')}
                className="text-[#8C3B3B] hover:text-[#2C2623] ml-2 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Toggle Mode: Create Room vs Join Code */}
        <div className="flex items-center gap-1 bg-[#EAE2D3]/70 p-1 rounded-2xl border border-[#DCD2C0] mb-5">
          <button
            type="button"
            onClick={() => { setTab('CREATE'); setNameError(''); }}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'CREATE'
                ? 'bg-[#FAF7F2] text-[#2C2623] shadow-card-tactile border border-[#E2D9C8]'
                : 'text-[#6E6259] hover:text-[#2C2623]'
            }`}
          >
            Create Table
          </button>
          <button
            type="button"
            onClick={() => { setTab('JOIN'); setNameError(''); }}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
              tab === 'JOIN'
                ? 'bg-[#FAF7F2] text-[#2C2623] shadow-card-tactile border border-[#E2D9C8]'
                : 'text-[#6E6259] hover:text-[#2C2623]'
            }`}
          >
            Join with Code
          </button>
        </div>

        {/* Player Name Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="player-handle-input" className="block text-[11px] font-mono uppercase tracking-wider text-[#6E6259] font-bold">
              Player Handle / Nickname
            </label>
            <button
              type="button"
              onClick={handleRandomizeName}
              className="text-[10px] font-mono text-[#8C4A1D] hover:text-[#2C2623] flex items-center gap-1 cursor-pointer transition-colors font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Randomize</span>
            </button>
          </div>
          <input
            id="player-handle-input"
            type="text"
            required
            maxLength={18}
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck="false"
            placeholder="e.g. Doyle Brunson"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`w-full bg-[#EAE2D3]/50 border rounded-xl px-4 py-2.5 sm:py-3 text-sm font-mono text-[#2C2623] placeholder:text-[#9A8E84] focus:outline-none transition-colors ${
              nameError ? 'border-[#D96B6B] ring-1 ring-[#D96B6B]/40' : 'border-[#DCD2C0] focus:border-[#8C4A1D]'
            }`}
          />
        </div>

        {/* Team Selection Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E6259] font-bold">
              Team Affiliation
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#9A8E84]">Team Play</span>
              <button
                type="button"
                onClick={() => setTeamMode(!teamMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  teamMode ? 'bg-[#9E7223]' : 'bg-[#DCD2C0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#FAF7F2] shadow-xs transition-transform ${
                    teamMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {teamMode && (
            <div className="grid grid-cols-3 gap-2">
              {TEAMS.map((t) => {
                const isSelected = selectedTeam === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTeam(t.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-[0.97] touch-manipulation ${
                      isSelected
                        ? `${t.accent} shadow-card-tactile ring-2 ring-white/80`
                        : 'border-[#E2D9C8] bg-[#FAF7F2] hover:bg-white text-[#6E6259]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                      <span className="text-xs font-mono font-bold">{t.name.replace('Team ', '')}</span>
                    </div>
                    <span className="text-[9px] font-mono opacity-80">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab 1: CREATE TABLE */}
        {tab === 'CREATE' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Table Settings Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#EAE2D3]/50 border border-[#DCD2C0]">
              {/* Starting Stack */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#6E6259] block mb-1">
                  Starting Stack
                </label>
                <select
                  value={startingStack}
                  onChange={(e) => setStartingStack(parseInt(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#DCD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#2C2623] focus:outline-none focus:border-[#8C4A1D] cursor-pointer"
                >
                  <option value={1000}>1,000 chips</option>
                  <option value={2000}>2,000 chips (Standard)</option>
                  <option value={5000}>5,000 chips (Deep Stack)</option>
                  <option value={10000}>10,000 chips (High Roller)</option>
                </select>
              </div>

              {/* Blinds */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#6E6259] block mb-1">
                  Blinds (SB / BB)
                </label>
                <select
                  value={`${smallBlind}/${bigBlind}`}
                  onChange={(e) => {
                    const [sb, bb] = e.target.value.split('/').map(Number);
                    setSmallBlind(sb);
                    setBigBlind(bb);
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#DCD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#2C2623] focus:outline-none focus:border-[#8C4A1D] cursor-pointer"
                >
                  <option value="5/10">5 / 10</option>
                  <option value="10/20">10 / 20 (Standard)</option>
                  <option value="25/50">25 / 50</option>
                  <option value="50/100">50 / 100</option>
                </select>
              </div>

              {/* Turn Timer */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#6E6259] block mb-1">
                  Turn Timer
                </label>
                <select
                  value={turnTimeLimit}
                  onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#DCD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#2C2623] focus:outline-none focus:border-[#8C4A1D] cursor-pointer"
                >
                  <option value={15}>15 Seconds (Fast)</option>
                  <option value={20}>20 Seconds (Standard)</option>
                  <option value={30}>30 Seconds (Relaxed)</option>
                </select>
              </div>

              {/* Time Bank */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#6E6259] block mb-1">
                  "Big Time" Bank
                </label>
                <select
                  value={timeBankReserve}
                  onChange={(e) => setTimeBankReserve(parseInt(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#DCD2C0] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#2C2623] focus:outline-none focus:border-[#8C4A1D] cursor-pointer"
                >
                  <option value={20}>+20s Reserve</option>
                  <option value={30}>+30s Reserve (Standard)</option>
                  <option value={60}>+60s Reserve (Deep)</option>
                </select>
              </div>
            </div>

            {/* Teammate Sweat Mode Toggle */}
            {teamMode && (
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#EAE2D3]/40 border border-[#DCD2C0]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#2C2623] block">
                    Teammate Sweat Mode
                  </span>
                  <span className="text-[10px] font-mono text-[#6E6259]">
                    Folded teammates can ghost-view active teammates' hole cards
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTeammateSweatMode(!teammateSweatMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    teammateSweatMode ? 'bg-[#36638F]' : 'bg-[#DCD2C0]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-[#FAF7F2] shadow-xs transition-transform ${
                      teammateSweatMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Launch Table Button: Tactile Warm Peach / Terracotta Keycap */}
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border border-[#E3B48D] border-b-2 border-b-[#CFA992] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-card-tactile transition-all active:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none"
            >
              <Play className="w-4 h-4 fill-[#8C4A1D]" />
              <span>{loading ? 'Creating Room...' : 'Launch Table'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6E6259] mb-1.5 font-bold">
                6-Character Room Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect="off"
                placeholder="e.g. 7K2M9X"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-[#EAE2D3]/50 border border-[#DCD2C0] rounded-xl px-4 py-3 text-base font-mono font-extrabold text-[#8C4A1D] uppercase tracking-widest placeholder:text-[#9A8E84] focus:outline-none focus:border-[#8C4A1D] transition-colors text-center"
              />
            </div>

            <button
              type="button"
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border border-[#E3B48D] border-b-2 border-b-[#CFA992] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-card-tactile transition-all active:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{loading ? 'Joining Room...' : 'Join Table'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
