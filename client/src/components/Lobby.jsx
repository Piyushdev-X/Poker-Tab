// client/src/components/Lobby.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Clock, Flame, Zap, ArrowRight, Play, RefreshCw } from 'lucide-react';

const TEAMS = [
  {
    id: 'ALPHA',
    name: 'Team Alpha',
    accent: 'border-[#F59E0B] text-[#92400E] bg-[#FEF3C7]',
    dot: 'bg-[#F59E0B]',
    desc: 'Amber Buttercup'
  },
  {
    id: 'OMEGA',
    name: 'Team Omega',
    accent: 'border-[#3B82F6] text-[#1E40AF] bg-[#DBEAFE]',
    dot: 'bg-[#3B82F6]',
    desc: 'Cobalt Sapphire'
  },
  {
    id: 'SIGMA',
    name: 'Team Sigma',
    accent: 'border-[#A855F7] text-[#6B21A8] bg-[#F3E8FF]',
    dot: 'bg-[#A855F7]',
    desc: 'Regal Violet'
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
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#F7F4EE]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#D5CCC0] rounded-3xl p-6 sm:p-8 shadow-hardware-pod overflow-hidden"
      >
        {/* Card Header Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#121110] text-[#FAF8F5] flex items-center justify-center text-2xl font-bold mb-3 shadow-md">
            ♠
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#121110] font-display">
            PokerTab
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#4A443E] font-bold mt-1">
            Warm Architectural Tabletop & Team Settlement Ledger
          </p>

          {/* Connection status badge */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F4EE] border border-[#D5CCC0]">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#166534]' : 'bg-[#DC2626] animate-pulse'}`} />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#121110]">
              {isConnected ? 'ENGINE ONLINE' : 'CONNECTING ENGINE...'}
            </span>
          </div>
        </div>

        {/* Error Alert if any */}
        {(errorMessage || nameError) && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] text-xs font-mono font-bold flex items-center justify-between">
            <span>{errorMessage || nameError}</span>
            {nameError && (
              <button
                type="button"
                onClick={() => setNameError('')}
                className="text-[#991B1B] hover:text-[#121110] ml-2 cursor-pointer font-black"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Toggle Mode: Create Room vs Join Code */}
        <div className="flex items-center gap-1.5 bg-[#F7F4EE] p-1.5 rounded-2xl border border-[#D5CCC0] mb-5">
          <button
            type="button"
            onClick={() => { setTab('CREATE'); setNameError(''); }}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
              tab === 'CREATE'
                ? 'bg-[#FFFFFF] text-[#121110] shadow-sm border border-[#D5CCC0]'
                : 'text-[#6E645A] hover:text-[#121110]'
            }`}
          >
            CREATE TABLE
          </button>
          <button
            type="button"
            onClick={() => { setTab('JOIN'); setNameError(''); }}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
              tab === 'JOIN'
                ? 'bg-[#FFFFFF] text-[#121110] shadow-sm border border-[#D5CCC0]'
                : 'text-[#6E645A] hover:text-[#121110]'
            }`}
          >
            JOIN WITH CODE
          </button>
        </div>

        {/* Player Name Input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="player-handle-input" className="block text-[11px] font-mono uppercase tracking-wider text-[#121110] font-black">
              PLAYER HANDLE / NICKNAME
            </label>
            <button
              type="button"
              onClick={handleRandomizeName}
              className="text-[10px] font-mono text-[#92400E] hover:text-[#121110] flex items-center gap-1 cursor-pointer transition-colors font-black"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RANDOMIZE</span>
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
            className={`w-full bg-[#F7F4EE] border-2 rounded-xl px-4 py-3 text-sm font-mono font-bold text-[#121110] placeholder:text-[#A89882] focus:outline-none transition-colors ${
              nameError ? 'border-[#DC2626] ring-2 ring-[#DC2626]/30' : 'border-[#D5CCC0] focus:border-[#92400E]'
            }`}
          />
        </div>

        {/* Team Selection */}
        {teamMode && (
          <div className="mb-5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#121110] font-black mb-2">
              AFFILIATED TEAM (3-WAY BANKROLL SETTLEMENT)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TEAMS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeam(t.id)}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                    selectedTeam === t.id
                      ? `${t.accent} ring-2 ring-current font-black shadow-sm`
                      : 'border-[#D5CCC0] bg-[#F7F4EE] hover:bg-[#FFFFFF] text-[#4A443E]'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${t.dot} mb-1`} />
                  <span className="text-xs font-mono font-black">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: CREATE TABLE */}
        {tab === 'CREATE' && (
          <div className="space-y-4">
            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#D5CCC0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4A443E] font-bold">STARTING STACK</span>
                <span className="tabular-nums font-mono font-black text-sm text-[#121110]">
                  {startingStack.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={startingStack}
                onChange={(e) => setStartingStack(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-[#4A443E] font-bold">BLINDS (SB/BB)</span>
                <span className="tabular-nums font-mono font-black text-sm text-[#121110]">
                  {smallBlind}/{bigBlind}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={smallBlind}
                onChange={(e) => {
                  const sb = parseInt(e.target.value);
                  setSmallBlind(sb);
                  setBigBlind(sb * 2);
                }}
                className="w-full cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-[#4A443E] font-bold">TURN TIME LIMIT</span>
                <span className="tabular-nums font-mono font-black text-sm text-[#121110]">
                  {turnTimeLimit}s
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={turnTimeLimit}
                onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#121110] hover:bg-[#2C2623] text-[#FAF8F5] font-mono text-sm font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>CREATING ROOM...</span>
              ) : (
                <>
                  <span>LAUNCH TABLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab Content: JOIN WITH CODE */}
        {tab === 'JOIN' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="room-code-input" className="block text-[11px] font-mono uppercase tracking-wider text-[#121110] font-black mb-1.5">
                6-CHARACTER ROOM CODE
              </label>
              <input
                id="room-code-input"
                type="text"
                maxLength={6}
                autoCapitalize="characters"
                placeholder="e.g. PT8899"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-[#F7F4EE] border-2 border-[#D5CCC0] focus:border-[#92400E] rounded-xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-[#121110] placeholder:text-[#A89882] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#121110] hover:bg-[#2C2623] text-[#FAF8F5] font-mono text-sm font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>CONNECTING...</span>
              ) : (
                <>
                  <span>JOIN TABLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
