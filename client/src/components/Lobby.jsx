// client/src/components/Lobby.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Clock, Flame, Zap, ArrowRight, Play, PlusCircle, Check } from 'lucide-react';

const TEAMS = [
  {
    id: 'ALPHA',
    name: 'Team Alpha',
    accent: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
    dot: 'bg-amber-400',
    desc: 'Imperial Gold'
  },
  {
    id: 'OMEGA',
    name: 'Team Omega',
    accent: 'border-sky-500/50 text-sky-400 bg-sky-500/10',
    dot: 'bg-sky-400',
    desc: 'Cobalt Ice'
  },
  {
    id: 'SIGMA',
    name: 'Team Sigma',
    accent: 'border-purple-500/50 text-purple-400 bg-purple-500/10',
    dot: 'bg-purple-400',
    desc: 'Titanium Amethyst'
  }
];

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  initialName = '',
  loading = false,
  errorMessage = ''
}) {
  const [tab, setTab] = useState('CREATE'); // 'CREATE' or 'JOIN'
  const [playerName, setPlayerName] = useState(initialName || '');
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

  const handleCreate = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

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
    e.preventDefault();
    if (!playerName.trim() || !joinCode.trim()) return;

    onJoinRoom({
      roomCode: joinCode.trim().toUpperCase(),
      name: playerName.trim(),
      team: teamMode ? selectedTeam : 'NONE'
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-obsidian flex flex-col items-center justify-center p-4 md:p-8 select-none">
      {/* Background Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,0.06),transparent_60%)] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl bg-obsidian-surface border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
      >
        {/* Card Header Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brass to-brass-dark flex items-center justify-center text-obsidian text-2xl font-bold mb-3 shadow-glow-active">
            ♠
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 font-display">
            PokerTab
          </h1>
          <p className="text-xs md:text-sm font-mono text-slate-400 mt-1">
            Real-Time Tabletop Engine & Team Settlement Ledger
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* Toggle Mode: Create Room vs Join Code */}
        <div className="flex items-center gap-1 bg-obsidian-deep/80 p-1 rounded-2xl border border-white/5 mb-6">
          <button
            onClick={() => setTab('CREATE')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all ${
              tab === 'CREATE'
                ? 'bg-brass text-obsidian shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Table
          </button>
          <button
            onClick={() => setTab('JOIN')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all ${
              tab === 'JOIN'
                ? 'bg-brass text-obsidian shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Join with Code
          </button>
        </div>

        {/* Player Name Input */}
        <div className="mb-5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
            Player Handle / Nickname
          </label>
          <input
            type="text"
            required
            maxLength={18}
            placeholder="e.g. Doyle Brunson"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brass/60 transition-colors"
          />
        </div>

        {/* Team Selection Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Team Affiliation
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">Team Play</span>
              <button
                type="button"
                onClick={() => setTeamMode(!teamMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  teamMode ? 'bg-brass' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-obsidian transition-transform ${
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
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-[0.97] ${
                      isSelected
                        ? `${t.accent} shadow-md ring-1 ring-white/20`
                        : 'border-white/5 bg-obsidian-deep hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                      <span className="text-xs font-mono font-bold">{t.name.replace('Team ', '')}</span>
                    </div>
                    <span className="text-[9px] font-mono opacity-70">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Body: CREATE vs JOIN */}
        {tab === 'CREATE' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Table Settings Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-obsidian-deep/80 border border-white/5">
              {/* Starting Stack */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Starting Stack
                </label>
                <select
                  value={startingStack}
                  onChange={(e) => setStartingStack(parseInt(e.target.value))}
                  className="w-full bg-obsidian-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brass"
                >
                  <option value={1000}>1,000 chips</option>
                  <option value={2000}>2,000 chips (Standard)</option>
                  <option value={5000}>5,000 chips (Deep Stack)</option>
                  <option value={10000}>10,000 chips (High Roller)</option>
                </select>
              </div>

              {/* Blinds */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Blinds (SB / BB)
                </label>
                <select
                  value={`${smallBlind}/${bigBlind}`}
                  onChange={(e) => {
                    const [sb, bb] = e.target.value.split('/').map(Number);
                    setSmallBlind(sb);
                    setBigBlind(bb);
                  }}
                  className="w-full bg-obsidian-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brass"
                >
                  <option value="5/10">5 / 10</option>
                  <option value="10/20">10 / 20 (Standard)</option>
                  <option value="25/50">25 / 50</option>
                  <option value="50/100">50 / 100</option>
                </select>
              </div>

              {/* Turn Timer */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Turn Timer
                </label>
                <select
                  value={turnTimeLimit}
                  onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
                  className="w-full bg-obsidian-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brass"
                >
                  <option value={15}>15 Seconds (Fast)</option>
                  <option value={20}>20 Seconds (Standard)</option>
                  <option value={30}>30 Seconds (Relaxed)</option>
                </select>
              </div>

              {/* Time Bank */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  "Big Time" Bank
                </label>
                <select
                  value={timeBankReserve}
                  onChange={(e) => setTimeBankReserve(parseInt(e.target.value))}
                  className="w-full bg-obsidian-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brass"
                >
                  <option value={20}>+20s Reserve</option>
                  <option value={30}>+30s Reserve (Standard)</option>
                  <option value={60}>+60s Reserve (Tournament)</option>
                </select>
              </div>
            </div>

            {/* Teammate Sweat Mode Toggle */}
            {teamMode && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-deep/60 border border-white/5">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Teammate Sweat Mode
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Folded teammates can ghost-view active teammates' hole cards
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
            )}

            {/* Launch Table Button */}
            <button
              type="submit"
              disabled={loading || !playerName.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brass to-brass-dark hover:from-brass-light hover:to-brass text-obsidian font-mono font-bold text-sm uppercase tracking-wider shadow-glow-active transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-obsidian" />
              <span>{loading ? 'Creating Room...' : 'Launch Table'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                6-Character Room Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 7K2M9X"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-4 py-3 text-base font-mono font-extrabold text-brass uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-brass/60 transition-colors text-center"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !playerName.trim() || !joinCode.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brass to-brass-dark hover:from-brass-light hover:to-brass text-obsidian font-mono font-bold text-sm uppercase tracking-wider shadow-glow-active transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
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
