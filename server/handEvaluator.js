// server/handEvaluator.js
// Deterministic 7-card Texas Hold'em Hand Evaluator & Live Hand Strength Telemetry

const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export const RANK_NAMES = {
  2: 'Deuces', 3: 'Threes', 4: 'Fours', 5: 'Fives', 6: 'Sixes', 7: 'Sevens',
  8: 'Eights', 9: 'Nines', 10: 'Tens', 11: 'Jacks', 12: 'Queens', 13: 'Kings', 14: 'Aces'
};

export const SINGULAR_RANK_NAMES = {
  2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
  8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace'
};

export const HAND_TYPES = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

// Generates all k-combinations from an array
function getCombinations(arr, k) {
  if (k === 1) return arr.map(el => [el]);
  const combinations = [];
  arr.forEach((head, i) => {
    const tail = arr.slice(i + 1);
    getCombinations(tail, k - 1).forEach(c => {
      combinations.push([head, ...c]);
    });
  });
  return combinations;
}

// Parses a card string (e.g. 'Ah', 'Ts', '2c') into { rank, suit, value }
export function parseCard(cardStr) {
  if (!cardStr || cardStr.length < 2) return null;
  const rank = cardStr[0].toUpperCase();
  const suit = cardStr[1].toLowerCase();
  return {
    raw: cardStr,
    rank,
    suit,
    value: RANK_VALUES[rank] || 0
  };
}

// Evaluates an exact 5-card combination
function evaluate5Cards(cards) {
  // Sort cards descending by value
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  const values = sorted.map(c => c.value);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight
  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHigh = values[0];
  } else if (
    values[0] === 14 && // Ace
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    // 5-high straight (wheel: A-2-3-4-5)
    isStraight = true;
    straightHigh = 5;
  }

  // Value frequency counts
  const counts = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }

  const freqEntries = Object.entries(counts).map(([val, count]) => ({
    val: parseInt(val),
    count
  }));

  // Sort by count descending, then by val descending
  freqEntries.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.val - a.val;
  });

  // Calculate tie-breaker score as a composite integer
  // Hand type (1-10) * 10^10 + rank1 * 10^8 + rank2 * 10^6 + rank3 * 10^4 + rank4 * 10^2 + rank5
  const baseMultiplier = 10000000000;

  // 1. Royal Flush & Straight Flush
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        type: HAND_TYPES.ROYAL_FLUSH,
        score: HAND_TYPES.ROYAL_FLUSH * baseMultiplier + straightHigh,
        name: 'Royal Flush',
        description: `Royal Flush in ${suits[0] === 's' ? 'Spades' : suits[0] === 'h' ? 'Hearts' : suits[0] === 'd' ? 'Diamonds' : 'Clubs'}`,
        cards: sorted
      };
    }
    return {
      type: HAND_TYPES.STRAIGHT_FLUSH,
      score: HAND_TYPES.STRAIGHT_FLUSH * baseMultiplier + straightHigh,
      name: 'Straight Flush',
      description: `${SINGULAR_RANK_NAMES[straightHigh]}-high Straight Flush`,
      cards: sorted
    };
  }

  // 2. Four of a Kind
  if (freqEntries[0].count === 4) {
    const quadVal = freqEntries[0].val;
    const kicker = freqEntries[1].val;
    return {
      type: HAND_TYPES.FOUR_OF_A_KIND,
      score: HAND_TYPES.FOUR_OF_A_KIND * baseMultiplier + quadVal * 100 + kicker,
      name: 'Four of a Kind',
      description: `Four of a Kind, ${RANK_NAMES[quadVal]} with ${SINGULAR_RANK_NAMES[kicker]} kicker`,
      cards: sorted
    };
  }

  // 3. Full House
  if (freqEntries[0].count === 3 && freqEntries[1].count === 2) {
    const tripVal = freqEntries[0].val;
    const pairVal = freqEntries[1].val;
    return {
      type: HAND_TYPES.FULL_HOUSE,
      score: HAND_TYPES.FULL_HOUSE * baseMultiplier + tripVal * 100 + pairVal,
      name: 'Full House',
      description: `Full House, ${RANK_NAMES[tripVal]} full of ${RANK_NAMES[pairVal]}`,
      cards: sorted
    };
  }

  // 4. Flush
  if (isFlush) {
    const tieBreak = values[0] * 160000 + values[1] * 8000 + values[2] * 400 + values[3] * 20 + values[4];
    return {
      type: HAND_TYPES.FLUSH,
      score: HAND_TYPES.FLUSH * baseMultiplier + tieBreak,
      name: 'Flush',
      description: `Flush, ${SINGULAR_RANK_NAMES[values[0]]}-high`,
      cards: sorted
    };
  }

  // 5. Straight
  if (isStraight) {
    return {
      type: HAND_TYPES.STRAIGHT,
      score: HAND_TYPES.STRAIGHT * baseMultiplier + straightHigh,
      name: 'Straight',
      description: `Straight, ${SINGULAR_RANK_NAMES[straightHigh]}-high`,
      cards: sorted
    };
  }

  // 6. Three of a Kind
  if (freqEntries[0].count === 3) {
    const tripVal = freqEntries[0].val;
    const k1 = freqEntries[1].val;
    const k2 = freqEntries[2].val;
    return {
      type: HAND_TYPES.THREE_OF_A_KIND,
      score: HAND_TYPES.THREE_OF_A_KIND * baseMultiplier + tripVal * 10000 + k1 * 100 + k2,
      name: 'Three of a Kind',
      description: `Three of a Kind, ${RANK_NAMES[tripVal]} (${SINGULAR_RANK_NAMES[k1]}, ${SINGULAR_RANK_NAMES[k2]} kickers)`,
      cards: sorted
    };
  }

  // 7. Two Pair
  if (freqEntries[0].count === 2 && freqEntries[1].count === 2) {
    const highPair = Math.max(freqEntries[0].val, freqEntries[1].val);
    const lowPair = Math.min(freqEntries[0].val, freqEntries[1].val);
    const kicker = freqEntries[2].val;
    return {
      type: HAND_TYPES.TWO_PAIR,
      score: HAND_TYPES.TWO_PAIR * baseMultiplier + highPair * 10000 + lowPair * 100 + kicker,
      name: 'Two Pair',
      description: `Two Pair, ${RANK_NAMES[highPair]} and ${RANK_NAMES[lowPair]}`,
      cards: sorted
    };
  }

  // 8. One Pair
  if (freqEntries[0].count === 2) {
    const pairVal = freqEntries[0].val;
    const k1 = freqEntries[1].val;
    const k2 = freqEntries[2].val;
    const k3 = freqEntries[3].val;
    return {
      type: HAND_TYPES.ONE_PAIR,
      score: HAND_TYPES.ONE_PAIR * baseMultiplier + pairVal * 1000000 + k1 * 10000 + k2 * 100 + k3,
      name: 'One Pair',
      description: `Pair of ${RANK_NAMES[pairVal]}`,
      cards: sorted
    };
  }

  // 9. High Card
  const tieBreak = values[0] * 160000 + values[1] * 8000 + values[2] * 400 + values[3] * 20 + values[4];
  return {
    type: HAND_TYPES.HIGH_CARD,
    score: HAND_TYPES.HIGH_CARD * baseMultiplier + tieBreak,
    name: 'High Card',
    description: `High Card, ${SINGULAR_RANK_NAMES[values[0]]}`,
    cards: sorted
  };
}

/**
 * Evaluates best 5-card hand out of 5 to 7 cards.
 * @param {Array<string>} cardStrings - e.g. ['Ah', 'Kh', 'Qh', 'Jh', 'Th', '2c', '7d']
 * @returns {Object} { type, score, name, description, bestFive: string[] }
 */
export function evaluate7Cards(cardStrings) {
  if (!cardStrings || cardStrings.length < 5) {
    return {
      type: 0,
      score: 0,
      name: 'Incomplete',
      description: 'Waiting for board cards',
      bestFive: cardStrings || []
    };
  }

  const parsed = cardStrings.map(parseCard).filter(Boolean);
  if (parsed.length < 5) {
    return {
      type: 0,
      score: 0,
      name: 'Incomplete',
      description: 'Invalid cards',
      bestFive: []
    };
  }

  const all5Combos = getCombinations(parsed, 5);
  let best = null;

  for (const combo of all5Combos) {
    const result = evaluate5Cards(combo);
    if (!best || result.score > best.score) {
      best = {
        ...result,
        bestFive: combo.map(c => c.raw)
      };
    }
  }

  return best;
}

/**
 * Calculates live telemetry/hand strength for an active player during any street.
 * @param {Array<string>} holeCards - e.g. ['Ah', 'Kh']
 * @param {Array<string>} communityCards - e.g. ['Qh', 'Jh', '2c']
 */
export function getLiveHandTelemetry(holeCards, communityCards = []) {
  if (!holeCards || holeCards.length < 2) return null;
  const h1 = parseCard(holeCards[0]);
  const h2 = parseCard(holeCards[1]);
  if (!h1 || !h2) return null;

  const totalCards = [...holeCards, ...communityCards];

  // Pre-flop telemetry
  if (communityCards.length === 0) {
    const isPair = h1.value === h2.value;
    const isSuited = h1.suit === h2.suit;
    const highVal = Math.max(h1.value, h2.value);
    const lowVal = Math.min(h1.value, h2.value);
    const gap = highVal - lowVal;

    if (isPair) {
      if (h1.value === 14) return { strength: 'Premium Pocket Aces', tier: 'nuts', advice: 'Raise / 3-Bet' };
      if (h1.value === 13) return { strength: 'Premium Pocket Kings', tier: 'nuts', advice: 'Raise / 3-Bet' };
      if (h1.value >= 10) return { strength: `High Pocket ${RANK_NAMES[h1.value]}`, tier: 'strong', advice: 'Value Raise' };
      return { strength: `Pocket ${RANK_NAMES[h1.value]}`, tier: 'playable', advice: 'Open / Call' };
    }

    if (highVal === 14 && lowVal === 13) {
      return { strength: isSuited ? 'Big Slick (AK Suited)' : 'Big Slick (AK Offsuit)', tier: 'nuts', advice: '3-Bet / Value' };
    }

    if (isSuited && gap === 1) {
      return { strength: `Suited Connector (${h1.rank}${h2.rank}s)`, tier: 'speculative', advice: 'Implied Odds' };
    }

    if (highVal === 14) {
      return { strength: `Ace High (${isSuited ? 'Suited' : 'Offsuit'})`, tier: 'playable', advice: 'Positional Open' };
    }

    return { strength: `${h1.rank}${h2.rank}${isSuited ? 's' : 'o'}`, tier: 'marginal', advice: 'Proceed with Caution' };
  }

  // 5 or more total cards: evaluate full hand
  if (totalCards.length >= 5) {
    const evalResult = evaluate7Cards(totalCards);

    // Check for draws if not yet river
    let drawNotes = '';
    if (communityCards.length < 5) {
      // Suit count for flush draws
      const suitCounts = {};
      totalCards.forEach(c => {
        const s = c[1].toLowerCase();
        suitCounts[s] = (suitCounts[s] || 0) + 1;
      });
      const maxSuitCount = Math.max(...Object.values(suitCounts));
      if (maxSuitCount === 4 && evalResult.type < HAND_TYPES.FLUSH) {
        drawNotes = ' + Four-to-a-Flush Draw';
      }
    }

    let tier = 'marginal';
    if (evalResult.type >= HAND_TYPES.FULL_HOUSE) tier = 'nuts';
    else if (evalResult.type >= HAND_TYPES.STRAIGHT) tier = 'strong';
    else if (evalResult.type >= HAND_TYPES.TWO_PAIR) tier = 'good';
    else if (evalResult.type === HAND_TYPES.ONE_PAIR) tier = 'playable';

    return {
      strength: `${evalResult.name}${drawNotes}`,
      description: evalResult.description,
      tier,
      bestFive: evalResult.bestFive
    };
  }

  // 3 or 4 cards total (e.g. partial community)
  return { strength: 'Developing Hand', tier: 'playable' };
}
