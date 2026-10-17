// server/index.js
// Express & Socket.io entry point for PokerTab
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false
  },
  pingTimeout: 30000,
  pingInterval: 15000,
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

const roomManager = new RoomManager(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    activeRooms: roomManager.rooms.size
  });
});

// REST API for direct ledger snapshot
app.get('/api/rooms/:code/ledger', (req, res) => {
  const ledger = roomManager.getLedger(req.params.code);
  if (!ledger) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(ledger);
});

// Serve frontend static build if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) next();
  });
});

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`[PokerTab Server] Client connected: ${socket.id}`);
  let currentRoomCode = null;
  let currentPlayerId = null;

  // 1. Create Room (supports both 'CREATE_ROOM' and 'create_room')
  const handleCreateRoom = (data, callback) => {
    try {
      const { hostPlayer, config } = data || {};
      if (!hostPlayer || !hostPlayer.id) {
        if (typeof callback === 'function') callback({ success: false, error: 'Invalid host player' });
        return;
      }

      const result = roomManager.createRoom(hostPlayer, config);
      if (result.success) {
        currentRoomCode = result.roomCode;
        currentPlayerId = hostPlayer.id;
        roomManager.joinRoom(result.roomCode, hostPlayer, socket);

        const room = roomManager.getRoom(result.roomCode);
        const tableState = room ? (room.table.getStateForPlayer ? room.table.getStateForPlayer(hostPlayer.id) : null) : null;

        if (typeof callback === 'function') {
          callback({ success: true, roomCode: result.roomCode, tableState });
        }
        socket.emit('ROOM_CREATED', { roomCode: result.roomCode, tableState });
        if (tableState) {
          socket.emit('TABLE_STATE', tableState);
        }
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, error: result.error });
        }
      }
    } catch (err) {
      console.error('CREATE_ROOM error:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  };

  socket.on('CREATE_ROOM', handleCreateRoom);
  socket.on('create_room', handleCreateRoom);

  // 2. Join Room (supports both 'JOIN_ROOM' and 'join_room')
  const handleJoinRoom = (data, callback) => {
    try {
      const { roomCode, player } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        if (typeof callback === 'function') {
          return callback({ success: false, error: 'Room not found. Check the 6-character code.' });
        }
        return;
      }
      currentRoomCode = room.code;
      currentPlayerId = player?.id;
      const joinResult = roomManager.joinRoom(room.code, player, socket);
      const tableState = room.table.getStateForPlayer ? room.table.getStateForPlayer(player?.id) : null;

      if (typeof callback === 'function') {
        callback({ ...joinResult, tableState });
      }
      socket.emit('ROOM_JOINED', { ...joinResult, tableState });
      if (tableState) {
        socket.emit('TABLE_STATE', tableState);
      }
    } catch (err) {
      console.error('JOIN_ROOM error:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  };


  socket.on('JOIN_ROOM', handleJoinRoom);
  socket.on('join_room', handleJoinRoom);


  // 3. Sit Down
  socket.on('SIT_DOWN', ({ roomCode, seatNumber, player }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });

    const result = room.table.sitPlayer(seatNumber, player);
    callback?.(result);
  });

  // 4. Stand Up
  socket.on('STAND_UP', ({ roomCode, playerId }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });

    const result = room.table.standPlayer(playerId);
    callback?.(result);
  });

  // 5. Rebuy
  socket.on('REBUY', ({ roomCode, playerId, amount }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });

    const result = room.table.rebuyPlayer(playerId, amount);
    if (result.success) {
      room.ledgerEvents.push({
        timestamp: Date.now(),
        type: 'PLAYER_REBUY',
        playerId,
        amount: amount || room.config.startingStack
      });
    }
    callback?.(result);
  });

  // 6. Player Action (fold, check, call, raise)
  socket.on('PLAYER_ACTION', ({ roomCode, playerId, action, amount }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });

    const result = room.table.playerAction(playerId, action, amount);
    callback?.(result);
  });

  // 7. Use "Big Time" (Time Bank)
  socket.on('USE_BIG_TIME', ({ roomCode, playerId }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found' });

    const result = room.table.useBigTime(playerId);
    callback?.(result);
  });

  // 8. Send Chat Message (All or Team)
  socket.on('SEND_CHAT', ({ roomCode, playerId, text, channel }) => {
    roomManager.handleChat(roomCode, playerId, text, channel);
  });

  // 9. Update Table Config
  socket.on('UPDATE_CONFIG', ({ roomCode, playerId, newConfig }, callback) => {
    const result = roomManager.updateConfig(roomCode, playerId, newConfig);
    callback?.(result);
  });

  // 10. Request Ledger
  socket.on('GET_LEDGER', ({ roomCode }, callback) => {
    const ledger = roomManager.getLedger(roomCode);
    callback?.(ledger);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (currentRoomCode && currentPlayerId) {
      roomManager.leaveRoom(currentRoomCode, currentPlayerId);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[PokerTab] Real-Time Poker Engine running on http://localhost:${PORT}`);
});
