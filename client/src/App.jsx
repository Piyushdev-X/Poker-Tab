// client/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import TeamHUD from './components/TeamHUD';
import PokerTable from './components/PokerTable';
import ActionDock from './components/ActionDock';
import LedgerDrawer from './components/LedgerDrawer';
import ChatDrawer from './components/ChatDrawer';
import HostSettingsModal from './components/HostSettingsModal';
import { sounds } from './audio';

// Dynamic socket URL based on host/environment
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [tableState, setTableState] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Drawers & Modals
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bigTimeBanner, setBigTimeBanner] = useState(null);

  // Persistent Player Identity
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('pokertab_player');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      team: 'ALPHA'
    };
  });

  useEffect(() => {
    localStorage.setItem('pokertab_player', JSON.stringify(player));
  }, [player]);

  // Initialize socket connection
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('[PokerTab] Connected to real-time engine:', s.id);
    });

    s.on('TABLE_STATE', (state) => {
      setTableState(state);
      if (state.hostId) setHostId(state.hostId);

      // Play tick sound when turn shifts to this player
      if (state.activeSeat !== -1) {
        const activeSeatObj = state.seats[state.activeSeat];
        if (activeSeatObj?.player?.id === player.id) {
          sounds.playTick();
        }
      }

      // Check for Big Time event
      if (state.extraEvent?.event === 'BIG_TIME_ACTIVATED') {
        sounds.playBigTime();
        setBigTimeBanner(`${state.extraEvent.playerName} burned their Time Bank (+${state.extraEvent.addedSeconds}s)!`);
        setTimeout(() => setBigTimeBanner(null), 4000);
      }
    });

    s.on('CHAT_MESSAGE', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    s.on('disconnect', () => {
      console.log('[PokerTab] Disconnected from engine');
    });

    setSocket(s);
    return () => s.disconnect();
  }, [player.id]);

  // Room Creation
  const handleCreateRoom = ({ name, team, config }) => {
    setLoading(true);
    setErrorMsg('');
    const updatedPlayer = { ...player, name, team };
    setPlayer(updatedPlayer);

    socket.emit('CREATE_ROOM', { hostPlayer: updatedPlayer, config }, (res) => {
      setLoading(false);
      if (res.success) {
        setRoomCode(res.roomCode);
        setInRoom(true);
      } else {
        setErrorMsg(res.error || 'Failed to create room');
      }
    });
  };

  // Join Room
  const handleJoinRoom = ({ roomCode: code, name, team }) => {
    setLoading(true);
    setErrorMsg('');
    const updatedPlayer = { ...player, name, team };
    setPlayer(updatedPlayer);

    socket.emit('JOIN_ROOM', { roomCode: code, player: updatedPlayer }, (res) => {
      setLoading(false);
      if (res.success) {
        setRoomCode(res.roomCode);
        setInRoom(true);
      } else {
        setErrorMsg(res.error || 'Failed to join room');
      }
    });
  };

  // Sit Down
  const handleSit = (seatNumber) => {
    if (!socket || !roomCode) return;
    sounds.playChip();
    socket.emit('SIT_DOWN', {
      roomCode,
      seatNumber,
      player
    }, (res) => {
      if (!res.success) {
        setErrorMsg(res.error || 'Could not sit down');
      }
    });
  };

  // Stand Up
  const handleStand = () => {
    if (!socket || !roomCode) return;
    socket.emit('STAND_UP', { roomCode, playerId: player.id });
  };

  // Player Poker Action
  const handleAction = (action, amount = 0) => {
    if (!socket || !roomCode) return;
    socket.emit('PLAYER_ACTION', {
      roomCode,
      playerId: player.id,
      action,
      amount
    });
  };

  // Trigger Big Time
  const handleBigTime = () => {
    if (!socket || !roomCode) return;
    socket.emit('USE_BIG_TIME', { roomCode, playerId: player.id });
  };

  // Rebuy chips
  const handleRebuy = (amount) => {
    if (!socket || !roomCode) return;
    sounds.playChip();
    socket.emit('REBUY', { roomCode, playerId: player.id, amount }, (res) => {
      if (res.success) {
        setIsLedgerOpen(false);
      }
    });
  };

  // Chat message send
  const handleSendMessage = (text, channel) => {
    if (!socket || !roomCode) return;
    socket.emit('SEND_CHAT', {
      roomCode,
      playerId: player.id,
      text,
      channel
    });
  };

  // Save updated host settings
  const handleSaveSettings = (newConfig) => {
    if (!socket || !roomCode) return;
    socket.emit('UPDATE_CONFIG', {
      roomCode,
      playerId: player.id,
      newConfig
    });
  };

  // Leave room back to lobby
  const handleLeaveRoom = () => {
    if (socket && roomCode) {
      socket.emit('STAND_UP', { roomCode, playerId: player.id });
    }
    setInRoom(false);
    setRoomCode('');
    setTableState(null);
  };

  // Detect my seated player data
  const mySeat = tableState?.seats?.find(s => s.player?.id === player.id);
  const myPlayer = mySeat?.player || null;
  const isHost = hostId === player.id;

  if (!inRoom) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        initialName={player.name}
        loading={loading}
        errorMessage={errorMsg}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-obsidian text-slate-100 flex flex-col overflow-hidden">
      {/* Top Telemetry Header */}
      <TeamHUD
        roomCode={roomCode}
        config={tableState?.config}
        teamBankrolls={tableState?.teamBankrolls}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveRoom={handleLeaveRoom}
        isHost={isHost}
      />

      {/* "Big Time" Event Banner Notification */}
      {bigTimeBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-mono font-bold shadow-glow-bigtime animate-bounce flex items-center gap-2">
          <span>🚨</span>
          <span>{bigTimeBanner}</span>
        </div>
      )}

      {/* Main Table View Area */}
      <main className="flex-1 flex items-center justify-center p-2 md:p-6 pb-28 md:pb-36 overflow-hidden">
        <PokerTable
          tableState={tableState}
          myPlayerId={player.id}
          onSit={handleSit}
          onStand={handleStand}
        />
      </main>

      {/* Bottom Cockpit Action Bar (when seated) */}
      {myPlayer && (
        <ActionDock
          tableState={tableState}
          myPlayer={myPlayer}
          mySeat={mySeat}
          onAction={handleAction}
          onBigTime={handleBigTime}
        />
      )}

      {/* "Poker Tab" Live Accounting Drawer */}
      <LedgerDrawer
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        roomCode={roomCode}
        socket={socket}
        myPlayerId={player.id}
        onRebuy={handleRebuy}
      />

      {/* Tactical & Table Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        myPlayer={myPlayer || player}
      />

      {/* Host Settings Modal */}
      <HostSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={tableState?.config}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
