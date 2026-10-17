// server/pokerEngine.js
// Server-Authoritative Texas Hold'em Game State Machine & Side Pot Calculator
import { evaluate7Cards, getLiveHandTelemetry } from './handEvaluator.js';

const SUITS = ['s', 'h', 'd', 'c'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export function createDeck() {
  const deck = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push(`${r}${s}`);
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export class PokerTable {
  constructor(roomId, config = {}, onStateChange, onHandEnd) {
    this.roomId = roomId;
    this.config = {
      maxSeats: config.maxSeats || 6,
      startingStack: config.startingStack || 2000,
      smallBlind: config.smallBlind || 10,
      bigBlind: config.bigBlind || 20,
      turnTimeLimit: config.turnTimeLimit || 20, // seconds
      timeBankReserve: config.timeBankReserve || 30, // seconds
      teamMode: config.teamMode || false,
      teammateSweatMode: config.teammateSweatMode || false, // ghost view
      ...config
    };

    this.onStateChange = onStateChange || (() => {});
    this.onHandEnd = onHandEnd || (() => {});

    // Seats array: fixed length (6 or 9)
    this.seats = Array.from({ length: this.config.maxSeats }, (_, index) => ({
      seatNumber: index,
      player: null // { id, name, team, chips, buyIn, rebuys, timeBank, isSittingOut }
    }));

    // Game state
    this.status = 'WAITING'; // WAITING, PRE_FLOP, FLOP, TURN, RIVER, SHOWDOWN, HAND_CLEANUP
    this.deck = [];
    this.communityCards = [];
    this.dealerSeat = 0;
    this.sbSeat = -1;
    this.bbSeat = -1;
    this.activeSeat = -1;
    this.currentBet = 0;
    this.minRaise = this.config.bigBlind;
    this.pot = 0;
    this.pots = []; // Array of { amount, eligiblePlayerIds }
    this.handNumber = 0;

    // Per-hand player data map: playerId -> { holeCards, folded, isAllIn, totalHandBet, streetBet, actedThisStreet }
    this.handPlayers = new Map();

    // Turn timer
    this.turnTimer = null;
    this.turnExpiresAt = null;
    this.bigTimeUsedThisTurn = false;

    // Last hand summary for showdown highlights
    this.lastShowdown = null;
  }

  // Find a player by ID across seats
  getPlayer(playerId) {
    for (const seat of this.seats) {
      if (seat.player && seat.player.id === playerId) {
        return { seat: seat.seatNumber, player: seat.player };
      }
    }
    return null;
  }

  sitPlayer(seatNumber, playerInfo) {
    if (seatNumber < 0 || seatNumber >= this.seats.length) return { success: false, error: 'Invalid seat' };
    if (this.seats[seatNumber].player) return { success: false, error: 'Seat occupied' };

    // Check if player is already seated elsewhere
    const existing = this.getPlayer(playerInfo.id);
    if (existing) {
      this.seats[existing.seat].player = null;
    }

    this.seats[seatNumber].player = {
      id: playerInfo.id,
      name: playerInfo.name,
      team: playerInfo.team || 'ALPHA', // ALPHA, OMEGA, SIGMA, or NONE
      chips: playerInfo.chips || this.config.startingStack,
      buyIn: playerInfo.chips || this.config.startingStack,
      rebuys: 0,
      timeBank: this.config.timeBankReserve,
      isSittingOut: false,
      ready: true
    };

    this.broadcastState();
    this.checkAutoStart();
    return { success: true };
  }

  standPlayer(playerId) {
    const existing = this.getPlayer(playerId);
    if (!existing) return { success: false, error: 'Not seated' };

    // If active in a hand, auto-fold first
    if (this.status !== 'WAITING' && this.handPlayers.has(playerId)) {
      const hp = this.handPlayers.get(playerId);
      if (!hp.folded) {
        this.playerAction(playerId, 'fold');
      }
    }

    this.seats[existing.seat].player = null;
    this.broadcastState();
    this.checkAutoStart();
    return { success: true };
  }

  rebuyPlayer(playerId, amount) {
    const p = this.getPlayer(playerId);
    if (!p) return { success: false, error: 'Player not found' };
    const rebuyAmount = amount || this.config.startingStack;
    p.player.chips += rebuyAmount;
    p.player.buyIn += rebuyAmount;
    p.player.rebuys += 1;
    this.broadcastState();
    this.checkAutoStart();
    return { success: true, chips: p.player.chips };
  }

  // Get active seated players with chips
  getEligiblePlayers() {
    return this.seats
      .filter(s => s.player && !s.player.isSittingOut && s.player.chips > 0)
      .map(s => ({ seat: s.seatNumber, player: s.player }));
  }

  checkAutoStart() {
    if (this.status !== 'WAITING') return;
    const eligible = this.getEligiblePlayers();
    if (eligible.length >= 2) {
      // Short delay before starting hand
      setTimeout(() => {
        if (this.status === 'WAITING' && this.getEligiblePlayers().length >= 2) {
          this.startHand();
        }
      }, 1000);
    }
  }

  startHand() {
    const eligible = this.getEligiblePlayers();
    if (eligible.length < 2) {
      this.status = 'WAITING';
      this.broadcastState();
      return;
    }

    this.handNumber++;
    this.deck = createDeck();
    this.communityCards = [];
    this.pot = 0;
    this.pots = [];
    this.handPlayers.clear();
    this.lastShowdown = null;

    // Reset player time banks slightly if low (recharge +5s up to max reserve)
    this.seats.forEach(s => {
      if (s.player) {
        s.player.timeBank = Math.min(this.config.timeBankReserve, s.player.timeBank + 5);
      }
    });

    // Advance Dealer button to next eligible player
    const seatsWithPlayers = eligible.map(e => e.seat);
    let nextDealerIndex = 0;
    const currentIdx = seatsWithPlayers.indexOf(this.dealerSeat);
    if (currentIdx !== -1) {
      nextDealerIndex = (currentIdx + 1) % seatsWithPlayers.length;
    }
    this.dealerSeat = seatsWithPlayers[nextDealerIndex];

    // Initialize handPlayers data
    for (const { player } of eligible) {
      this.handPlayers.set(player.id, {
        id: player.id,
        seat: this.getPlayer(player.id).seat,
        name: player.name,
        team: player.team,
        holeCards: [this.deck.pop(), this.deck.pop()],
        folded: false,
        isAllIn: false,
        totalHandBet: 0,
        streetBet: 0,
        actedThisStreet: false
      });
    }

    // Determine Blinds & First to act
    const isHeadsUp = eligible.length === 2;
    if (isHeadsUp) {
      // In Heads-Up:
      // Dealer posts SB and acts FIRST pre-flop.
      // Non-dealer posts BB and acts SECOND pre-flop.
      // Post-flop, BB acts first and Dealer acts last!
      this.sbSeat = this.dealerSeat;
      this.bbSeat = seatsWithPlayers.find(s => s !== this.dealerSeat);
    } else {
      // 3+ players:
      // SB is next seat clockwise after Dealer
      // BB is next seat clockwise after SB
      const dIndex = seatsWithPlayers.indexOf(this.dealerSeat);
      const sbIndex = (dIndex + 1) % seatsWithPlayers.length;
      const bbIndex = (dIndex + 2) % seatsWithPlayers.length;
      this.sbSeat = seatsWithPlayers[sbIndex];
      this.bbSeat = seatsWithPlayers[bbIndex];
    }

    // Deduct Blinds automatically
    this.postBlind(this.sbSeat, this.config.smallBlind, 'SB');
    this.postBlind(this.bbSeat, this.config.bigBlind, 'BB');

    this.currentBet = this.config.bigBlind;
    this.minRaise = this.config.bigBlind;
    this.status = 'PRE_FLOP';

    // First to act pre-flop:
    if (isHeadsUp) {
      // Dealer (SB) acts first pre-flop
      this.activeSeat = this.dealerSeat;
    } else {
      // UTG: player next to BB
      const dIndex = seatsWithPlayers.indexOf(this.dealerSeat);
      const utgIndex = (dIndex + 3) % seatsWithPlayers.length;
      this.activeSeat = seatsWithPlayers[utgIndex];
    }

    this.broadcastState();
    this.startTurnTimer();
  }

  postBlind(seatNumber, amount, type) {
    const seat = this.seats[seatNumber];
    if (!seat || !seat.player) return;
    const player = seat.player;
    const hp = this.handPlayers.get(player.id);
    if (!hp) return;

    const actualBet = Math.min(player.chips, amount);
    player.chips -= actualBet;
    hp.streetBet += actualBet;
    hp.totalHandBet += actualBet;
    this.pot += actualBet;

    if (player.chips === 0) {
      hp.isAllIn = true;
    }
  }

  startTurnTimer() {
    this.clearTurnTimer();
    this.bigTimeUsedThisTurn = false;

    const activeSeatObj = this.seats[this.activeSeat];
    if (!activeSeatObj || !activeSeatObj.player) return;

    const timeLimit = this.config.turnTimeLimit;
    this.turnExpiresAt = Date.now() + timeLimit * 1000;

    this.turnTimer = setTimeout(() => {
      this.handleTimeout();
    }, timeLimit * 1000);
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    this.turnExpiresAt = null;
  }

  useBigTime(playerId) {
    const currentActivePlayer = this.getActivePlayer();
    if (!currentActivePlayer || currentActivePlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }
    if (this.bigTimeUsedThisTurn) {
      return { success: false, error: 'Big Time already used this turn' };
    }
    if (currentActivePlayer.timeBank < 10) {
      return { success: false, error: 'Insufficient Time Bank reserve' };
    }

    const addedSeconds = Math.min(30, currentActivePlayer.timeBank);
    currentActivePlayer.timeBank -= addedSeconds;
    this.bigTimeUsedThisTurn = true;

    // Extend timer
    if (this.turnTimer) clearTimeout(this.turnTimer);
    const remainingTime = Math.max(0, this.turnExpiresAt - Date.now());
    const newTotalMs = remainingTime + addedSeconds * 1000;
    this.turnExpiresAt = Date.now() + newTotalMs;

    this.turnTimer = setTimeout(() => {
      this.handleTimeout();
    }, newTotalMs);

    this.broadcastState({
      event: 'BIG_TIME_ACTIVATED',
      playerId,
      playerName: currentActivePlayer.name,
      addedSeconds
    });

    return { success: true, remainingBank: currentActivePlayer.timeBank };
  }

  handleTimeout() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer) return;
    const hp = this.handPlayers.get(activePlayer.id);
    if (!hp) return;

    // If current street bet can be checked, check; otherwise fold!
    const toCall = this.currentBet - hp.streetBet;
    if (toCall === 0) {
      this.playerAction(activePlayer.id, 'check');
    } else {
      this.playerAction(activePlayer.id, 'fold');
    }
  }

  getActivePlayer() {
    if (this.activeSeat === -1) return null;
    const seat = this.seats[this.activeSeat];
    return seat ? seat.player : null;
  }

  playerAction(playerId, action, amount = 0) {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const hp = this.handPlayers.get(playerId);
    if (!hp || hp.folded || hp.isAllIn) {
      return { success: false, error: 'Cannot act in current state' };
    }

    const toCall = this.currentBet - hp.streetBet;

    if (action === 'fold') {
      hp.folded = true;
      hp.actedThisStreet = true;
    } else if (action === 'check') {
      if (toCall > 0) {
        return { success: false, error: `Cannot check; ${toCall} chips to call` };
      }
      hp.actedThisStreet = true;
    } else if (action === 'call') {
      const callAmount = Math.min(activePlayer.chips, toCall);
      activePlayer.chips -= callAmount;
      hp.streetBet += callAmount;
      hp.totalHandBet += callAmount;
      this.pot += callAmount;
      if (activePlayer.chips === 0) {
        hp.isAllIn = true;
      }
      hp.actedThisStreet = true;
    } else if (action === 'raise' || action === 'bet') {
      // Amount is total target street bet (e.g. raise to 100)
      const minValid = this.currentBet + this.minRaise;
      const targetStreetBet = Math.max(minValid, Math.min(hp.streetBet + activePlayer.chips, amount));
      const addedChips = targetStreetBet - hp.streetBet;

      if (addedChips <= 0 || addedChips > activePlayer.chips) {
        return { success: false, error: 'Invalid raise amount' };
      }

      // If not an all-in and below min raise, reject
      if (addedChips < activePlayer.chips && targetStreetBet < minValid) {
        return { success: false, error: `Minimum raise is to ${minValid}` };
      }

      const raiseDiff = targetStreetBet - this.currentBet;
      if (raiseDiff > this.minRaise) {
        this.minRaise = raiseDiff;
      }

      activePlayer.chips -= addedChips;
      hp.streetBet = targetStreetBet;
      hp.totalHandBet += addedChips;
      this.pot += addedChips;
      this.currentBet = targetStreetBet;

      if (activePlayer.chips === 0) {
        hp.isAllIn = true;
      }

      // Re-open betting for all other un-folded players
      for (const [id, playerState] of this.handPlayers) {
        if (id !== playerId && !playerState.folded && !playerState.isAllIn) {
          playerState.actedThisStreet = false;
        }
      }
      hp.actedThisStreet = true;
    } else {
      return { success: false, error: 'Unknown action' };
    }

    this.clearTurnTimer();

    // Check if only 1 active player remains (everyone else folded)
    const activeUnfolded = Array.from(this.handPlayers.values()).filter(p => !p.folded);
    if (activeUnfolded.length === 1) {
      this.awardPotToSoleSurvivor(activeUnfolded[0]);
      return { success: true };
    }

    // Check if street is complete
    if (this.isStreetComplete()) {
      this.advanceStreet();
    } else {
      this.moveToNextPlayer();
    }

    return { success: true };
  }

  isStreetComplete() {
    const activePlayers = Array.from(this.handPlayers.values()).filter(p => !p.folded);
    // If all but at most one player are all-in, street is effectively complete
    const nonAllIn = activePlayers.filter(p => !p.isAllIn);
    if (nonAllIn.length <= 1) {
      // Check if the remaining non-all-in player has matched the bet or acted
      return nonAllIn.every(p => p.actedThisStreet && p.streetBet === this.currentBet);
    }

    // Every active player must have acted and matched currentBet (or be all-in)
    return activePlayers.every(p => p.isAllIn || (p.actedThisStreet && p.streetBet === this.currentBet));
  }

  moveToNextPlayer() {
    const activeSeats = this.seats
      .map(s => s.seatNumber)
      .filter(sNum => {
        const p = this.seats[sNum].player;
        if (!p) return false;
        const hp = this.handPlayers.get(p.id);
        return hp && !hp.folded && !hp.isAllIn;
      });

    if (activeSeats.length === 0) {
      this.advanceStreet();
      return;
    }

    // Find next seat clockwise from activeSeat
    let nextSeat = -1;
    for (let i = 1; i <= this.config.maxSeats; i++) {
      const candidate = (this.activeSeat + i) % this.config.maxSeats;
      if (activeSeats.includes(candidate)) {
        nextSeat = candidate;
        break;
      }
    }

    this.activeSeat = nextSeat;
    this.broadcastState();
    this.startTurnTimer();
  }

  advanceStreet() {
    // Reset street bets and acted flags
    for (const hp of this.handPlayers.values()) {
      hp.streetBet = 0;
      hp.actedThisStreet = false;
    }
    this.currentBet = 0;
    this.minRaise = this.config.bigBlind;

    // Check if players can still bet or if all-in showdown
    const nonAllInActive = Array.from(this.handPlayers.values()).filter(p => !p.folded && !p.isAllIn);
    const isAutoRun = nonAllInActive.length <= 1;

    if (this.status === 'PRE_FLOP') {
      this.status = 'FLOP';
      // Burn 1, deal 3
      this.deck.pop();
      this.communityCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    } else if (this.status === 'FLOP') {
      this.status = 'TURN';
      // Burn 1, deal 1
      this.deck.pop();
      this.communityCards.push(this.deck.pop());
    } else if (this.status === 'TURN') {
      this.status = 'RIVER';
      // Burn 1, deal 1
      this.deck.pop();
      this.communityCards.push(this.deck.pop());
    } else if (this.status === 'RIVER') {
      this.handleShowdown();
      return;
    }

    if (isAutoRun) {
      // Auto run through remaining streets with small delays for visual pacing
      this.broadcastState();
      setTimeout(() => {
        if (this.status !== 'SHOWDOWN' && this.status !== 'WAITING') {
          this.advanceStreet();
        }
      }, 1500);
      return;
    }

    // Post-flop: first active player clockwise from Dealer acts first
    this.setFirstToActPostFlop();
    this.broadcastState();
    this.startTurnTimer();
  }

  setFirstToActPostFlop() {
    const activeSeats = this.seats
      .map(s => s.seatNumber)
      .filter(sNum => {
        const p = this.seats[sNum].player;
        if (!p) return false;
        const hp = this.handPlayers.get(p.id);
        return hp && !hp.folded && !hp.isAllIn;
      });

    for (let i = 1; i <= this.config.maxSeats; i++) {
      const candidate = (this.dealerSeat + i) % this.config.maxSeats;
      if (activeSeats.includes(candidate)) {
        this.activeSeat = candidate;
        return;
      }
    }
    this.activeSeat = -1;
  }

  awardPotToSoleSurvivor(survivor) {
    this.clearTurnTimer();
    const winningPlayer = this.getPlayer(survivor.id).player;
    winningPlayer.chips += this.pot;

    this.lastShowdown = {
      type: 'SOLE_SURVIVOR',
      winners: [{
        playerId: survivor.id,
        playerName: survivor.name,
        team: survivor.team,
        amount: this.pot,
        description: 'Everyone else folded'
      }],
      winningCards: [],
      payouts: [{ playerId: survivor.id, amount: this.pot }]
    };

    this.pot = 0;
    this.status = 'HAND_CLEANUP';
    this.broadcastState();
    this.onHandEnd(this.lastShowdown);

    setTimeout(() => {
      this.status = 'WAITING';
      this.checkAutoStart();
    }, 3500);
  }

  // Calculate side pots and determine winners deterministically
  handleShowdown() {
    this.clearTurnTimer();
    this.status = 'SHOWDOWN';

    // Calculate side pots based on totalHandBet from all players
    const allPlayers = Array.from(this.handPlayers.values());
    const contributingPlayers = allPlayers.filter(p => p.totalHandBet > 0);

    // Group bets by distinct total contributions
    const uniqueBets = [...new Set(contributingPlayers.map(p => p.totalHandBet))].sort((a, b) => a - b);

    const computedPots = [];
    let previousLevel = 0;

    for (const level of uniqueBets) {
      const potSize = contributingPlayers.reduce((sum, p) => {
        const contribution = Math.min(p.totalHandBet, level) - Math.min(p.totalHandBet, previousLevel);
        return sum + Math.max(0, contribution);
      }, 0);

      if (potSize > 0) {
        // Eligible players for this pot level are non-folded players who contributed at least this level
        const eligible = contributingPlayers
          .filter(p => !p.folded && p.totalHandBet >= level)
          .map(p => p.id);

        computedPots.push({
          amount: potSize,
          eligible
        });
      }
      previousLevel = level;
    }

    // Evaluate hand for each non-folded player
    const playerEvals = new Map();
    for (const hp of allPlayers) {
      if (!hp.folded) {
        const evalResult = evaluate7Cards([...hp.holeCards, ...this.communityCards]);
        playerEvals.set(hp.id, evalResult);
      }
    }

    const winnersSummary = [];
    const winningCardSet = new Set();

    // Award each computed pot to best hand among eligible
    for (const pot of computedPots) {
      if (pot.eligible.length === 0) continue;

      let bestScore = -1;
      let winningIds = [];

      for (const pid of pot.eligible) {
        const ev = playerEvals.get(pid);
        if (!ev) continue;
        if (ev.score > bestScore) {
          bestScore = ev.score;
          winningIds = [pid];
        } else if (ev.score === bestScore) {
          winningIds.push(pid);
        }
      }

      const splitAmount = Math.floor(pot.amount / winningIds.length);
      const remainder = pot.amount % winningIds.length;

      winningIds.forEach((wid, idx) => {
        const playerObj = this.getPlayer(wid).player;
        const payout = splitAmount + (idx === 0 ? remainder : 0);
        playerObj.chips += payout;

        const ev = playerEvals.get(wid);
        if (ev && ev.bestFive) {
          ev.bestFive.forEach(c => winningCardSet.add(c));
        }

        winnersSummary.push({
          playerId: wid,
          playerName: playerObj.name,
          team: playerObj.team,
          amount: payout,
          handName: ev.name,
          description: ev.description,
          holeCards: this.handPlayers.get(wid).holeCards
        });
      });
    }

    this.lastShowdown = {
      type: 'SHOWDOWN',
      winners: winnersSummary,
      winningCards: Array.from(winningCardSet),
      hands: Array.from(playerEvals.entries()).map(([pid, ev]) => ({
        playerId: pid,
        holeCards: this.handPlayers.get(pid).holeCards,
        name: ev.name,
        description: ev.description,
        score: ev.score,
        bestFive: ev.bestFive
      }))
    };

    this.pot = 0;
    this.broadcastState();
    this.onHandEnd(this.lastShowdown);

    // Schedule next hand
    setTimeout(() => {
      this.status = 'WAITING';
      this.checkAutoStart();
    }, 6000);
  }

  // Public state alias
  getPublicState(playerId) {
    return this.getStateForPlayer(playerId);
  }

  // Sanitized state representation sent to clients
  getStateForPlayer(playerId) {
    const requestingPlayerSeat = this.getPlayer(playerId);
    const requestingPlayer = requestingPlayerSeat ? requestingPlayerSeat.player : null;
    const requestingTeam = requestingPlayer ? requestingPlayer.team : null;
    const requestingHp = requestingPlayer ? this.handPlayers.get(requestingPlayer.id) : null;
    const isRequestingPlayerFolded = requestingHp ? requestingHp.folded : false;

    // Build seats data
    const sanitizedSeats = this.seats.map(s => {
      if (!s.player) return { seatNumber: s.seatNumber, player: null };
      const hp = this.handPlayers.get(s.player.id);

      let holeCards = null;
      let isVisible = false;

      if (hp && hp.holeCards && hp.holeCards.length === 2) {
        // Condition 1: Hero's own seat - hole cards are private to Hero
        if (s.player.id === playerId) {
          holeCards = hp.holeCards;
          isVisible = true;
        } 
        // Condition 2: Showdown - reveal cards of all active, non-folded players
        else if (this.status === 'SHOWDOWN' && !hp.folded) {
          holeCards = hp.holeCards;
          isVisible = true;
        } 
        // Condition 3: Teammate Sweat Mode (Strict Exception)
        // a player can only peek at a teammate's cards AFTER the player themselves has folded,
        // and never an opponent team's cards.
        else if (
          this.config.teamMode &&
          this.config.teammateSweatMode &&
          isRequestingPlayerFolded &&
          requestingTeam &&
          s.player.team === requestingTeam &&
          s.player.team !== 'NONE'
        ) {
          holeCards = hp.holeCards;
          isVisible = true;
        } 
        // In ALL other cases: Opponents who have cards and haven't folded receive masked card backs
        else {
          if (!hp.folded) {
            holeCards = [{ hidden: true }, { hidden: true }];
          } else {
            holeCards = null;
          }
          isVisible = false;
        }
      }

      return {
        seatNumber: s.seatNumber,
        player: {
          id: s.player.id,
          name: s.player.name,
          team: s.player.team,
          chips: s.player.chips,
          buyIn: s.player.buyIn,
          rebuys: s.player.rebuys,
          timeBank: s.player.timeBank,
          isSittingOut: s.player.isSittingOut,
          isTurn: s.seatNumber === this.activeSeat,
          folded: hp ? hp.folded : false,
          isAllIn: hp ? hp.isAllIn : false,
          streetBet: hp ? hp.streetBet : 0,
          totalHandBet: hp ? hp.totalHandBet : 0,
          holeCards,
          cards: holeCards,
          hasHoleCards: Boolean(hp && hp.holeCards && hp.holeCards.length === 2 && !hp.folded),
          isCardVisible: isVisible
        }
      };
    });

    // Compute live telemetry for this player
    let liveTelemetry = null;
    if (playerId && this.handPlayers.has(playerId)) {
      const hp = this.handPlayers.get(playerId);
      if (hp && !hp.folded && hp.holeCards) {
        liveTelemetry = getLiveHandTelemetry(hp.holeCards, this.communityCards);
      }
    }

    // Compute team bankroll stats
    const teamBankrolls = {
      ALPHA: { chips: 0, buyIn: 0, pnl: 0, players: 0 },
      OMEGA: { chips: 0, buyIn: 0, pnl: 0, players: 0 },
      SIGMA: { chips: 0, buyIn: 0, pnl: 0, players: 0 },
    };

    this.seats.forEach(s => {
      if (s.player && teamBankrolls[s.player.team]) {
        const t = teamBankrolls[s.player.team];
        t.chips += s.player.chips;
        t.buyIn += s.player.buyIn;
        t.pnl = t.chips - t.buyIn;
        t.players += 1;
      }
    });

    return {
      roomId: this.roomId,
      config: this.config,
      status: this.status,
      phase: this.status,
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      dealerSeat: this.dealerSeat,
      sbSeat: this.sbSeat,
      bbSeat: this.bbSeat,
      activeSeat: this.activeSeat,
      handNumber: this.handNumber,
      turnExpiresAt: this.turnExpiresAt,
      seats: sanitizedSeats,
      liveTelemetry,
      teamBankrolls,
      lastShowdown: this.lastShowdown
    };
  }

  broadcastState(extraEvent = null) {
    this.onStateChange(this, extraEvent);
  }
}
