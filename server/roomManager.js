// server/roomManager.js
// Room lifecycle, Team communication channels, and Live Buy-In/Settlement Ledger

import { PokerTable } from './pokerEngine.js';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars (I, 1, O, 0)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> Room
  }

  createRoom(hostPlayer, customConfig = {}) {
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const config = {
      maxSeats: customConfig.maxSeats || 6,
      startingStack: customConfig.startingStack || 2000,
      smallBlind: customConfig.smallBlind || 10,
      bigBlind: customConfig.bigBlind || 20,
      turnTimeLimit: customConfig.turnTimeLimit || 20,
      timeBankReserve: customConfig.timeBankReserve || 30,
      teamMode: customConfig.teamMode !== undefined ? customConfig.teamMode : true,
      teammateSweatMode: customConfig.teammateSweatMode !== undefined ? customConfig.teammateSweatMode : true,
      ...customConfig
    };

    const table = new PokerTable(
      roomCode,
      config,
      (tbl, extraEvent) => this.broadcastTableState(roomCode, extraEvent),
      (showdown) => this.broadcastHandEnd(roomCode, showdown)
    );

    const room = {
      code: roomCode,
      hostId: hostPlayer.id,
      createdAt: Date.now(),
      config,
      table,
      players: new Map(), // playerId -> { id, name, team, socketId, connected }
      chatHistory: [],
      ledgerEvents: [
        {
          timestamp: Date.now(),
          type: 'ROOM_CREATED',
          description: `Room created by ${hostPlayer.name} with ${config.startingStack} starting stack`
        }
      ]
    };

    this.rooms.set(roomCode, room);
    return { success: true, roomCode, config };
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase()) || null;
  }

  joinRoom(roomCode, playerInfo, socket) {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false, error: 'Room not found' };

    room.players.set(playerInfo.id, {
      id: playerInfo.id,
      name: playerInfo.name,
      team: playerInfo.team || 'ALPHA',
      socketId: socket.id,
      connected: true
    });

    socket.join(room.code);
    socket.join(`${room.code}_TEAM_${playerInfo.team || 'ALPHA'}`);

    room.ledgerEvents.push({
      timestamp: Date.now(),
      type: 'PLAYER_JOINED',
      playerId: playerInfo.id,
      playerName: playerInfo.name,
      team: playerInfo.team || 'ALPHA'
    });

    this.broadcastTableState(room.code);
    return { success: true, roomCode: room.code, config: room.config, hostId: room.hostId };
  }

  leaveRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    room.table.standPlayer(playerId);
    room.players.delete(playerId);

    // If host left, assign new host if any remain
    if (room.hostId === playerId && room.players.size > 0) {
      room.hostId = room.players.keys().next().value;
    }

    if (room.players.size === 0) {
      // Room empty: clean up table timer and delete after grace period
      room.table.clearTurnTimer();
      this.rooms.delete(room.code);
    } else {
      this.broadcastTableState(room.code);
    }
  }

  updateConfig(roomCode, playerId, newConfig) {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== playerId) return { success: false, error: 'Only host can change table settings' };

    Object.assign(room.config, newConfig);
    Object.assign(room.table.config, newConfig);

    room.ledgerEvents.push({
      timestamp: Date.now(),
      type: 'CONFIG_UPDATED',
      config: newConfig
    });

    this.broadcastTableState(room.code);
    return { success: true, config: room.config };
  }

  handleChat(roomCode, playerId, messageText, channel = 'ALL') {
    const room = this.getRoom(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    const chatMsg = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: playerId,
      senderName: player.name,
      team: player.team,
      text: messageText.trim(),
      channel, // 'ALL' or 'TEAM'
      timestamp: Date.now()
    };

    room.chatHistory.push(chatMsg);
    if (room.chatHistory.length > 100) room.chatHistory.shift();

    if (channel === 'TEAM') {
      this.io.to(`${room.code}_TEAM_${player.team}`).emit('CHAT_MESSAGE', chatMsg);
    } else {
      this.io.to(room.code).emit('CHAT_MESSAGE', chatMsg);
    }
  }

  broadcastTableState(roomCode, extraEvent = null) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    // Send individualized states so hole cards are kept strictly secret except for teammate sweat mode
    for (const [playerId, pData] of room.players) {
      const state = room.table.getStateForPlayer(playerId);
      this.io.to(pData.socketId).emit('TABLE_STATE', {
        ...state,
        hostId: room.hostId,
        extraEvent
      });
    }
  }

  broadcastHandEnd(roomCode, showdown) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    room.ledgerEvents.push({
      timestamp: Date.now(),
      type: 'HAND_COMPLETED',
      handNumber: room.table.handNumber,
      winners: showdown.winners
    });

    this.io.to(roomCode).emit('HAND_END', showdown);
  }

  getLedger(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const playersLedger = [];
    let totalBuyIns = 0;
    let totalChipsOnTable = 0;

    room.table.seats.forEach(s => {
      if (s.player) {
        const netPnL = s.player.chips - s.player.buyIn;
        totalBuyIns += s.player.buyIn;
        totalChipsOnTable += s.player.chips;

        playersLedger.push({
          playerId: s.player.id,
          name: s.player.name,
          team: s.player.team,
          buyIn: s.player.buyIn,
          rebuys: s.player.rebuys,
          currentChips: s.player.chips,
          netPnL,
          isSittingOut: s.player.isSittingOut
        });
      }
    });

    // Calculate settlements using greedily minimized transaction graph
    const settlements = this.calculateSettlements(playersLedger);

    return {
      roomCode: room.code,
      totalBuyIns,
      totalChipsOnTable,
      players: playersLedger,
      teamStats: room.table.getStateForPlayer(null).teamBankrolls,
      events: room.ledgerEvents.slice(-25),
      settlements
    };
  }

  calculateSettlements(players) {
    // Balances: creditors (+ netPnL) and debtors (- netPnL)
    const creditors = [];
    const debtors = [];

    players.forEach(p => {
      if (p.netPnL > 0) {
        creditors.push({ name: p.name, team: p.team, amount: p.netPnL });
      } else if (p.netPnL < 0) {
        debtors.push({ name: p.name, team: p.team, amount: Math.abs(p.netPnL) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transfers = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const matchAmount = Math.min(creditors[i].amount, debtors[j].amount);
      if (matchAmount > 0) {
        transfers.push({
          from: debtors[j].name,
          fromTeam: debtors[j].team,
          to: creditors[i].name,
          toTeam: creditors[i].team,
          amount: matchAmount
        });

        creditors[i].amount -= matchAmount;
        debtors[j].amount -= matchAmount;
      }

      if (creditors[i].amount === 0) i++;
      if (debtors[j].amount === 0) j++;
    }

    return transfers;
  }
}
