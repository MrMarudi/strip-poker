import { Card, Rank, HandRank, HandResult } from './types';

// ── Rank helpers ──────────────────────────────────────────────────────

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Returns the numeric value of a card rank (2 = 2, ..., A = 14).
 */
export function getRankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

// ── Combination generation ────────────────────────────────────────────

/**
 * Generates all k-length combinations from `arr`.
 */
function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  function helper(start: number, chosen: T[]) {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      chosen.push(arr[i]);
      helper(i + 1, chosen);
      chosen.pop();
    }
  }
  helper(0, []);
  return result;
}

// ── Five-card evaluation ──────────────────────────────────────────────

/**
 * Evaluates exactly 5 cards and returns a HandResult.
 */
function evaluateFiveCards(cards: Card[]): HandResult {
  if (cards.length !== 5) {
    throw new Error('evaluateFiveCards requires exactly 5 cards');
  }

  const sorted = [...cards].sort(
    (a, b) => getRankValue(b.rank) - getRankValue(a.rank)
  );
  const values = sorted.map((c) => getRankValue(c.rank));

  // Count occurrences of each rank value
  const countMap = new Map<number, number>();
  for (const v of values) {
    countMap.set(v, (countMap.get(v) ?? 0) + 1);
  }

  // Sort groups: first by count desc, then by value desc
  const groups = Array.from(countMap.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // higher count first
    return b[0] - a[0]; // higher value first
  });

  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);

  // Straight detection (including A-2-3-4-5 wheel)
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight check
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  if (uniqueValues.length >= 5) {
    // Check descending consecutive run
    if (uniqueValues[0] - uniqueValues[4] === 4) {
      isStraight = true;
      straightHigh = uniqueValues[0];
    }
    // Ace-low straight (A-2-3-4-5 = wheel)
    if (
      !isStraight &&
      uniqueValues.includes(14) &&
      uniqueValues.includes(2) &&
      uniqueValues.includes(3) &&
      uniqueValues.includes(4) &&
      uniqueValues.includes(5)
    ) {
      isStraight = true;
      straightHigh = 5; // 5-high straight
    }
  }

  // Determine hand rank
  const counts = groups.map((g) => g[1]);

  let rank: HandRank;
  let value: number;
  let description: string;

  if (isFlush && isStraight && straightHigh === 14) {
    rank = 'Royal Flush';
    value = 9;
    description = `Royal Flush of ${sorted[0].suit}`;
  } else if (isFlush && isStraight) {
    rank = 'Straight Flush';
    value = 8;
    description = `Straight Flush, ${rankLabel(straightHigh)} high`;
  } else if (counts[0] === 4) {
    rank = 'Four of a Kind';
    value = 7;
    description = `Four of a Kind, ${rankLabel(groups[0][0])}s`;
  } else if (counts[0] === 3 && counts[1] === 2) {
    rank = 'Full House';
    value = 6;
    description = `Full House, ${rankLabel(groups[0][0])}s full of ${rankLabel(groups[1][0])}s`;
  } else if (isFlush) {
    rank = 'Flush';
    value = 5;
    description = `Flush, ${rankLabel(values[0])} high`;
  } else if (isStraight) {
    rank = 'Straight';
    value = 4;
    description = `Straight, ${rankLabel(straightHigh)} high`;
  } else if (counts[0] === 3) {
    rank = 'Three of a Kind';
    value = 3;
    description = `Three of a Kind, ${rankLabel(groups[0][0])}s`;
  } else if (counts[0] === 2 && counts[1] === 2) {
    rank = 'Two Pair';
    value = 2;
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    description = `Two Pair, ${rankLabel(highPair)}s and ${rankLabel(lowPair)}s`;
  } else if (counts[0] === 2) {
    rank = 'One Pair';
    value = 1;
    description = `One Pair, ${rankLabel(groups[0][0])}s`;
  } else {
    rank = 'High Card';
    value = 0;
    description = `High Card, ${rankLabel(values[0])}`;
  }

  return { rank, value, cards: sorted, description };
}

/**
 * Returns a human-readable label for a numeric rank value.
 */
function rankLabel(v: number): string {
  switch (v) {
    case 14: return 'Ace';
    case 13: return 'King';
    case 12: return 'Queen';
    case 11: return 'Jack';
    default: return String(v);
  }
}

// ── Tie-breaking score ────────────────────────────────────────────────

/**
 * Produces a numeric array used for tie-breaking within the same hand rank.
 * The first element is always the HandResult.value (0-9).
 * Subsequent elements depend on the hand category.
 */
function tieBreakers(result: HandResult): number[] {
  const values = result.cards.map((c) => getRankValue(c.rank));

  const countMap = new Map<number, number>();
  for (const v of values) {
    countMap.set(v, (countMap.get(v) ?? 0) + 1);
  }

  // Group by (count desc, value desc)
  const groups = Array.from(countMap.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  switch (result.rank) {
    case 'Royal Flush':
      // All royal flushes are equal
      return [result.value];

    case 'Straight Flush':
    case 'Straight': {
      // Determine straight high; handle wheel (A-2-3-4-5)
      const sorted = [...new Set(values)].sort((a, b) => b - a);
      let high = sorted[0];
      if (sorted[0] === 14 && sorted[1] === 5) {
        high = 5; // wheel
      }
      return [result.value, high];
    }

    case 'Four of a Kind':
      // Quads value, then kicker
      return [result.value, groups[0][0], groups[1][0]];

    case 'Full House':
      // Trips value, then pair value
      return [result.value, groups[0][0], groups[1][0]];

    case 'Flush':
      // All five card values, descending
      return [result.value, ...values.sort((a, b) => b - a)];

    case 'Three of a Kind':
      // Trips value, then kickers descending
      return [
        result.value,
        groups[0][0],
        ...groups.slice(1).map((g) => g[0]).sort((a, b) => b - a),
      ];

    case 'Two Pair': {
      const highPair = Math.max(groups[0][0], groups[1][0]);
      const lowPair = Math.min(groups[0][0], groups[1][0]);
      const kicker = groups[2][0];
      return [result.value, highPair, lowPair, kicker];
    }

    case 'One Pair': {
      const pairVal = groups[0][0];
      const kickers = groups
        .slice(1)
        .map((g) => g[0])
        .sort((a, b) => b - a);
      return [result.value, pairVal, ...kickers];
    }

    case 'High Card':
      return [result.value, ...values.sort((a, b) => b - a)];
  }
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Evaluates 5, 6, or 7 cards and returns the best possible 5-card hand.
 * When given more than 5 cards it checks all C(n,5) combinations.
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(
      `evaluateHand expects 5-7 cards, received ${cards.length}`
    );
  }

  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }

  // Evaluate every 5-card combination and keep the best
  const combos = combinations(cards, 5);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluateFiveCards(combo);
    if (best === null || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

/**
 * Compares two evaluated hands.
 *   Returns > 0 if hand1 wins.
 *   Returns < 0 if hand2 wins.
 *   Returns 0 if tie.
 */
export function compareHands(
  hand1: HandResult,
  hand2: HandResult
): number {
  const tb1 = tieBreakers(hand1);
  const tb2 = tieBreakers(hand2);
  const len = Math.max(tb1.length, tb2.length);

  for (let i = 0; i < len; i++) {
    const v1 = tb1[i] ?? 0;
    const v2 = tb2[i] ?? 0;
    if (v1 !== v2) return v1 - v2;
  }
  return 0;
}
