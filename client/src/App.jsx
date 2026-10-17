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

// Dynamic socket URL: honors VITE_SOCKET_URL, auto-detects Vercel/dev, or uses Render
const getSocketUrl = () => {
  if (import.meta.env?.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined') {
    // If running on Vercel (production or preview), connect to Render backend
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://poker-tab.onrender.com';
    }
    // When accessing Vite dev server locally (port 5173), direct to backend port 3001
    if (window.location.port === '5173') {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    // In production / Render / unified Express server
    return window.location.origin;
  }
  return 'https://poker-tab.onrender.com';
};
const SOCKET_URL = getSocketUrl();


// Local in-memory offline fallback table generator

function createLocalTableState(player, config = {}) {
  const maxSeats = config.maxSeats || 6;
  const startingStack = config.startingStack || 2000;
  const seats = [];

  for (let i = 0; i < maxSeats; i++) {
    if (i === 0) {
      seats.push({
        seatNumber: 0,
        player: {
          id: player.id,
          name: player.name,
          team: player.team || 'ALPHA',
          chips: startingStack,
          buyIn: startingStack,
          rebuys: 0,
          timeBank: config.timeBankReserve || 30,
          isSittingOut: false,
          isTurn: false,
          folded: false,
          isAllIn: false,
          streetBet: 0,
          totalHandBet: 0,
          holeCards: [
            { rank: 'A', suit: 's' },
            { rank: 'K', suit: 'h' }
          ],
          hasHoleCards: true,
          isCardVisible: true
        }
      });
    } else {
      seats.push({
        seatNumber: i,
        player: null
      });
    }
  }

  return {
    roomId: 'SANDBOX',
    config: {
      maxSeats,
      startingStack,
      smallBlind: config.smallBlind || 10,
      bigBlind: config.bigBlind || 20,
      turnTimeLimit: config.turnTimeLimit || 20,
      timeBankReserve: config.timeBankReserve || 30,
      teamMode: config.teamMode !== undefined ? config.teamMode : true,
      teammateSweatMode: config.teammateSweatMode !== undefined ? config.teammateSweatMode : true,
      ...config
    },
    status: 'WAITING',
    communityCards: [],
    pot: 0,
    currentBet: 0,
    minRaise: config.bigBlind || 20,
    dealerSeat: 0,
    sbSeat: 0,
    bbSeat: 0,
    activeSeat: -1,
    handNumber: 1,
    turnExpiresAt: null,
    seats,
    liveTelemetry: {
      handName: 'Pocket Aces / Big Slick',
      description: 'High card / Starting pair in local sandbox'
    },
    teamBankrolls: {
      ALPHA: { chips: startingStack, buyIn: startingStack, pnl: 0, players: 1 },
      OMEGA: { chips: 0, buyIn: 0, pnl: 0, players: 0 },
      SIGMA: { chips: 0, buyIn: 0, pnl: 0, players: 0 }
    },
    lastShowdown: null,
    hostId: player.id,
    isLocalFallback: true
  };
}

export default function App() {

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    s.on('connect', () => {
      console.log('[PokerTab] Connected to real-time engine:', s.id);
      setIsConnected(true);
      setErrorMsg('');
    });

    s.on('connect_error', (err) => {
      console.warn('[PokerTab] Socket connection error:', err?.message);
      setIsConnected(false);
    });

    s.on('disconnect', () => {
      console.log('[PokerTab] Disconnected from engine');
      setIsConnected(false);
    });

    s.on('ROOM_CREATED', (data) => {
      console.log('[PokerTab] ROOM_CREATED event received:', data);
      if (data?.roomCode) {
        setRoomCode(data.roomCode);
        if (data.tableState) setTableState(data.tableState);
        setInRoom(true);
        setLoading(false);
      }
    });


    s.on('ROOM_JOINED', (data) => {
      console.log('[PokerTab] ROOM_JOINED event received:', data);
      if (data?.roomCode) {
        setRoomCode(data.roomCode);
        if (data.tableState) setTableState(data.tableState);
        setInRoom(true);
        setLoading(false);
      }
    });

    s.on('TABLE_STATE', (state) => {
      setTableState(state);
      if (state.hostId) setHostId(state.hostId);
      if (state.roomId) setRoomCode(state.roomId);
      setInRoom(true);
      setLoading(false);

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

    setSocket(s);
    return () => s.disconnect();
  }, [player.id]);

  // Room Creation
  // Pre-warm Render backend on initial page load if pointing to Render
  useEffect(() => {
    if (SOCKET_URL.includes('onrender.com')) {
      fetch(`${SOCKET_URL}/api/health`, { mode: 'cors' }).catch(() => {});
    }
  }, []);

  // Room Creation
  const handleCreateRoom = ({ name, team, config }) => {
    setLoading(true);
    setErrorMsg('');
    const updatedPlayer = { ...player, name, team };
    setPlayer(updatedPlayer);

    // Dynamic timeout: allow 15 seconds if connecting to Render cold start, or 3s locally
    const timeoutDuration = SOCKET_URL.includes('onrender.com') ? 15000 : 3000;
    const fallbackTimer = setTimeout(() => {
      console.warn('[PokerTab] Backend timeout or disconnected. Activating local offline table.');
      const localState = createLocalTableState(updatedPlayer, config);
      setTableState(localState);
      setRoomCode('SANDBOX');
      setHostId(updatedPlayer.id);
      setInRoom(true);
      setLoading(false);
      setBigTimeBanner('Local Tabletop Simulation Active');
      setTimeout(() => setBigTimeBanner(null), 4000);
    }, timeoutDuration);

    if (socket && socket.connected) {
      socket.emit('CREATE_ROOM', { hostPlayer: updatedPlayer, config }, (res) => {
        clearTimeout(fallbackTimer);
        setLoading(false);
        if (res?.success) {
          setRoomCode(res.roomCode);
          if (res.tableState) setTableState(res.tableState);
          setInRoom(true);
        } else {
          setErrorMsg(res?.error || 'Failed to create room');
        }
      });
    } else {
      // If connecting to Render, wait for connection instead of instantly opening sandbox
      if (SOCKET_URL.includes('onrender.com')) {
        setErrorMsg('Waking up Render game engine, please wait a moment...');
      } else {
        clearTimeout(fallbackTimer);
        const localState = createLocalTableState(updatedPlayer, config);
        setTableState(localState);
        setRoomCode('SANDBOX');
        setHostId(updatedPlayer.id);
        setInRoom(true);
        setLoading(false);
      }
    }
  };

  // Join Room
  const handleJoinRoom = ({ roomCode: code, name, team }) => {
    setLoading(true);
    setErrorMsg('');
    const updatedPlayer = { ...player, name, team };
    setPlayer(updatedPlayer);

    const timer = setTimeout(() => {
      setLoading(false);
      setErrorMsg('Server took too long to respond. Render may still be waking up — please try again in 10 seconds.');
    }, 15000);


    if (socket && socket.connected) {
      socket.emit('JOIN_ROOM', { roomCode: code, player: updatedPlayer }, (res) => {
        clearTimeout(timer);
        setLoading(false);
        if (res?.success) {
          setRoomCode(res.roomCode);
          if (res.tableState) setTableState(res.tableState);
          setInRoom(true);
        } else {
          setErrorMsg(res?.error || 'Failed to join room');
        }
      });
    } else {
      clearTimeout(timer);
      setLoading(false);
      setErrorMsg('Server offline. You can create a local table sandbox to play immediately.');
    }
  };

  // Sit Down
  const handleSit = (seatNumber) => {
    sounds.playChip();
    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('SIT_DOWN', {
        roomCode,
        seatNumber,
        player
      }, (res) => {
        if (!res?.success) {
          setErrorMsg(res?.error || 'Could not sit down');
        }
      });
    } else {
      // Local sandbox sit
      setTableState(prev => {
        if (!prev) return prev;
        const newSeats = [...prev.seats];
        newSeats[seatNumber] = {
          seatNumber,
          player: {
            id: player.id,
            name: player.name,
            team: player.team,
            chips: prev.config?.startingStack || 2000,
            buyIn: prev.config?.startingStack || 2000,
            rebuys: 0,
            timeBank: prev.config?.timeBankReserve || 30,
            isSittingOut: false,
            isTurn: false,
            folded: false,
            isAllIn: false,
            streetBet: 0,
            totalHandBet: 0,
            holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'd' }],
            hasHoleCards: true,
            isCardVisible: true
          }
        };
        return { ...prev, seats: newSeats };
      });
    }
  };

  // Stand Up
  const handleStand = () => {
    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('STAND_UP', { roomCode, playerId: player.id });
    } else {
      setTableState(prev => {
        if (!prev) return prev;
        const newSeats = prev.seats.map(s => s.player?.id === player.id ? { seatNumber: s.seatNumber, player: null } : s);
        return { ...prev, seats: newSeats };
      });
    }
  };

  // Player Poker Action
  const handleAction = (action, amount = 0) => {
    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('PLAYER_ACTION', {
        roomCode,
        playerId: player.id,
        action,
        amount
      });
    } else {
      if (action === 'CHECK') sounds.playCheck();
      else if (action === 'FOLD') sounds.playCard();
      else sounds.playChip();
    }
  };

  // Trigger Big Time
  const handleBigTime = () => {
    sounds.playBigTime();
    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('USE_BIG_TIME', { roomCode, playerId: player.id });
    }
  };

  // Rebuy chips
  const handleRebuy = (amount) => {
    sounds.playChip();
    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('REBUY', { roomCode, playerId: player.id, amount }, (res) => {
        if (res?.success) {
          setIsLedgerOpen(false);
        }
      });
    } else {
      setIsLedgerOpen(false);
      setTableState(prev => {
        if (!prev) return prev;
        const start = amount || prev.config?.startingStack || 2000;
        const newSeats = prev.seats.map(s => {
          if (s.player?.id === player.id) {
            return {
              ...s,
              player: {
                ...s.player,
                chips: s.player.chips + start,
                buyIn: s.player.buyIn + start,
                rebuys: s.player.rebuys + 1
              }
            };
          }
          return s;
        });
        return { ...prev, seats: newSeats };
      });
    }
  };


  // Add Automated Test Bot to table
  const handleAddBot = () => {
    sounds.playChip();
    const botNames = ['Doyle_Bot', 'Ivey_Bot', 'Brunson_Bot', 'Maverick_Bot', 'VegasKid_Bot', 'RiverKing_Bot'];
    const botTeams = ['ALPHA', 'OMEGA', 'SIGMA'];
    const botId = `bot_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const botTeam = botTeams[Math.floor(Math.random() * botTeams.length)];

    const emptySeat = tableState?.seats?.find(s => !s.player);
    if (!emptySeat) return;
    const seatNumber = emptySeat.seatNumber;

    const botPlayer = {
      id: botId,
      name: botName,
      team: botTeam,
      chips: tableState?.config?.startingStack || 2000,
      buyIn: tableState?.config?.startingStack || 2000,
      rebuys: 0,
      timeBank: tableState?.config?.timeBankReserve || 30,
      isSittingOut: false
    };

    if (socket && socket.connected && roomCode !== 'SANDBOX') {
      socket.emit('SIT_DOWN', {
        roomCode,
        seatNumber,
        player: botPlayer
      });
    } else {
      setTableState(prev => {
        if (!prev) return prev;
        const newSeats = [...prev.seats];
        newSeats[seatNumber] = {
          seatNumber,
          player: {
            ...botPlayer,
            isTurn: false,
            folded: false,
            isAllIn: false,
            streetBet: 0,
            totalHandBet: 0,
            holeCards: ['Ks', 'Qh'],
            hasHoleCards: true,
            isCardVisible: false
          }
        };
        return { ...prev, seats: newSeats };
      });
    }
  };

  // Immediate Test Hand Deal
  const handleDealTestHand = () => {
    sounds.playCard();
    const suits = ['s', 'h', 'd', 'c'];
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8'];
    const randomCard = () => `${ranks[Math.floor(Math.random() * ranks.length)]}${suits[Math.floor(Math.random() * suits.length)]}`;

    setTableState(prev => {
      if (!prev) return prev;
      const sb = prev.config?.smallBlind || 10;
      const bb = prev.config?.bigBlind || 20;
      const newPot = sb + bb;

      const updatedSeats = prev.seats.map((s, idx) => {
        if (!s.player) return s;
        const isMySeat = s.player.id === player.id;
        const isSB = idx === 0;
        const isBB = idx === 1;
        const bet = isSB ? sb : isBB ? bb : 0;
        return {
          ...s,
          player: {
            ...s.player,
            chips: Math.max(0, s.player.chips - bet),
            streetBet: bet,
            totalHandBet: bet,
            folded: false,
            isAllIn: false,
            isTurn: isMySeat,
            holeCards: isMySeat ? ['As', 'Kh'] : [randomCard(), randomCard()],
            hasHoleCards: true,
            isCardVisible: isMySeat
          }
        };
      });

      return {
        ...prev,
        status: 'FLOP',
        communityCards: [randomCard(), randomCard(), randomCard()],
        pot: newPot,
        currentBet: bb,
        activeSeat: 0,
        turnExpiresAt: Date.now() + 20000,
        lastShowdown: null,
        liveTelemetry: {
          strength: 'Two Pair (Aces & Kings)',
          tier: 'nuts',
          description: 'Dominant starting holding with top two pair'
        }
      };
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
        isConnected={isConnected}
      />
    );
  }

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full text-[#121110] flex flex-col overflow-hidden bg-[#F7F4EE]">
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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#F3E8FF] border border-[#A855F7] text-[#6B21A8] text-xs font-mono font-black shadow-glow-bigtime animate-bounce flex items-center gap-2">
          <span>⏰</span>
          <span>{bigTimeBanner}</span>
        </div>
      )}

      {/* Main Table View Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 pb-24 md:pb-32 overflow-hidden">
        <PokerTable
          tableState={tableState}
          myPlayerId={player.id}
          onSit={handleSit}
          onStand={handleStand}
          onAddBot={handleAddBot}
          onDealTestHand={handleDealTestHand}
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
