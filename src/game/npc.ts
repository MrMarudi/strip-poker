import {
  GameState,
  PlayerAction,
  Difficulty,
  Card,
} from './types';
import { evaluateHand } from './evaluator';

// ── Hand strength helpers ─────────────────────────────────────────────

/**
 * Returns a normalised hand-strength score between 0 and 1.
 * 0 = worst possible, 1 = best possible.
 *
 * Before the flop the score is derived solely from the two hole cards.
 * After community cards are dealt the evaluator is used.
 */
function getHandStrength(hand: Card[], communityCards: Card[]): number {
  if (communityCards.length === 0) {
    return getPreflopStrength(hand);
  }

  const allCards = [...hand, ...communityCards];
  if (allCards.length < 5) {
    // Should not happen in normal flow, but guard anyway.
    return getPreflopStrength(hand);
  }

  const result = evaluateHand(allCards);

  // Map HandResult.value (0-9) to a 0-1 range, with a small bonus for
  // higher kickers so that e.g. a pair of Aces scores above a pair of 2s.
  const base = result.value / 9;
  const kickerBonus =
    result.cards.reduce((sum, c) => sum + cardNumericValue(c), 0) /
    (14 * 5) *
    0.1; // tiny nudge

  return Math.min(base + kickerBonus, 1);
}

function cardNumericValue(card: Card): number {
  const map: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13, A: 14,
  };
  return map[card.rank];
}

/**
 * Simple pre-flop hand-strength heuristic.
 */
function getPreflopStrength(hand: Card[]): number {
  if (hand.length < 2) return 0.2;

  const v1 = cardNumericValue(hand[0]);
  const v2 = cardNumericValue(hand[1]);
  const high = Math.max(v1, v2);
  const low = Math.min(v1, v2);
  const suited = hand[0].suit === hand[1].suit;
  const pair = v1 === v2;

  let score = 0;

  if (pair) {
    // Pairs: 22 = ~0.45, AA = ~0.95
    score = 0.45 + ((high - 2) / 12) * 0.5;
  } else {
    // High card contribution
    score = (high + low) / 28 * 0.5; // 0..~0.5
    // Connectedness bonus
    const gap = high - low;
    if (gap === 1) score += 0.05;
    else if (gap === 2) score += 0.03;
    // Suited bonus
    if (suited) score += 0.06;
    // Big card bonus
    if (high >= 13) score += 0.05;
    if (low >= 13) score += 0.05;
  }

  return Math.min(Math.max(score, 0), 1);
}

// ── Cost helpers ──────────────────────────────────────────────────────

function costToCall(state: GameState, playerIndex: number): number {
  const player = state.players[playerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  return Math.max(0, highestBet - player.currentBet);
}

function canCheck(state: GameState, playerIndex: number): boolean {
  return costToCall(state, playerIndex) === 0;
}

// ── Difficulty strategies ─────────────────────────────────────────────

function easyAction(
  state: GameState,
  npcIndex: number
): { action: PlayerAction; amount: number } {
  const player = state.players[npcIndex];
  const call = costToCall(state, npcIndex);
  const strength = getHandStrength(player.hand, state.communityCards);

  const roll = Math.random();

  // Occasionally fold even reasonable hands (bad play)
  if (roll < 0.1 && !canCheck(state, npcIndex)) {
    return { action: 'fold', amount: 0 };
  }

  // If free to check, usually check; small chance of a random raise
  if (canCheck(state, npcIndex)) {
    if (roll > 0.85 && strength > 0.4) {
      const raiseAmt = state.bigBlind;
      if (player.chips >= raiseAmt) {
        return { action: 'raise', amount: raiseAmt };
      }
    }
    return { action: 'check', amount: 0 };
  }

  // Facing a bet: mostly call, sometimes fold weak hands
  if (strength < 0.25 && roll < 0.5) {
    return { action: 'fold', amount: 0 };
  }

  if (call >= player.chips) {
    // Must go all-in to continue
    return strength > 0.3
      ? { action: 'all-in', amount: player.chips }
      : { action: 'fold', amount: 0 };
  }

  return { action: 'call', amount: call };
}

function mediumAction(
  state: GameState,
  npcIndex: number
): { action: PlayerAction; amount: number } {
  const player = state.players[npcIndex];
  const call = costToCall(state, npcIndex);
  const strength = getHandStrength(player.hand, state.communityCards);
  const potOdds = call > 0 ? call / (state.pot + call) : 0;

  // Free check
  if (canCheck(state, npcIndex)) {
    if (strength > 0.65) {
      const raiseAmt = Math.max(
        state.bigBlind,
        Math.floor(state.pot * 0.5)
      );
      if (player.chips >= raiseAmt) {
        return { action: 'raise', amount: raiseAmt };
      }
    }
    if (strength > 0.45 && Math.random() < 0.3) {
      const raiseAmt = state.bigBlind;
      if (player.chips >= raiseAmt) {
        return { action: 'raise', amount: raiseAmt };
      }
    }
    return { action: 'check', amount: 0 };
  }

  // Facing a bet
  if (strength < 0.2) {
    return { action: 'fold', amount: 0 };
  }

  if (strength < potOdds) {
    return { action: 'fold', amount: 0 };
  }

  if (call >= player.chips) {
    return strength > 0.5
      ? { action: 'all-in', amount: player.chips }
      : { action: 'fold', amount: 0 };
  }

  // Strong hand: raise
  if (strength > 0.7) {
    const raiseAmt = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.6)
    );
    if (player.chips >= call + raiseAmt) {
      return { action: 'raise', amount: raiseAmt };
    }
  }

  return { action: 'call', amount: call };
}

function hardAction(
  state: GameState,
  npcIndex: number
): { action: PlayerAction; amount: number } {
  const player = state.players[npcIndex];
  const call = costToCall(state, npcIndex);
  const strength = getHandStrength(player.hand, state.communityCards);
  const potOdds = call > 0 ? call / (state.pot + call) : 0;

  const activePlayers = state.players.filter((p) => !p.folded).length;
  // Adjust strength downward with more opponents (multiway pots)
  const adjustedStrength = strength * (1 - (activePlayers - 2) * 0.03);

  // Bluff probability (higher in later streets, lower with many opponents)
  const bluffChance =
    state.phase === 'river'
      ? 0.2
      : state.phase === 'turn'
        ? 0.12
        : 0.06;

  // Free check
  if (canCheck(state, npcIndex)) {
    // Strong hand: bet for value
    if (adjustedStrength > 0.6) {
      const sizeFactor = adjustedStrength > 0.8 ? 0.75 : 0.5;
      const raiseAmt = Math.max(
        state.bigBlind,
        Math.floor(state.pot * sizeFactor)
      );
      if (player.chips >= raiseAmt) {
        return { action: 'raise', amount: raiseAmt };
      }
    }
    // Occasional bluff
    if (adjustedStrength < 0.3 && Math.random() < bluffChance) {
      const raiseAmt = Math.max(
        state.bigBlind,
        Math.floor(state.pot * 0.6)
      );
      if (player.chips >= raiseAmt) {
        return { action: 'raise', amount: raiseAmt };
      }
    }
    return { action: 'check', amount: 0 };
  }

  // Facing a bet

  // Very strong: re-raise
  if (adjustedStrength > 0.8) {
    const raiseAmt = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.75)
    );
    if (player.chips >= call + raiseAmt) {
      return { action: 'raise', amount: raiseAmt };
    }
    if (player.chips <= call) {
      return { action: 'all-in', amount: player.chips };
    }
    return { action: 'call', amount: call };
  }

  // Decent hand: call if pot odds are right
  if (adjustedStrength >= potOdds + 0.05) {
    if (call >= player.chips) {
      return adjustedStrength > 0.55
        ? { action: 'all-in', amount: player.chips }
        : { action: 'fold', amount: 0 };
    }
    return { action: 'call', amount: call };
  }

  // Bluff re-raise with a weak hand occasionally
  if (adjustedStrength < 0.25 && Math.random() < bluffChance * 0.5) {
    const raiseAmt = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.65)
    );
    if (player.chips >= call + raiseAmt) {
      return { action: 'raise', amount: raiseAmt };
    }
  }

  // Otherwise fold
  return { action: 'fold', amount: 0 };
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Returns the action and amount an NPC should take given the current
 * game state, the NPC's index, and the chosen difficulty level.
 */
export function getNPCAction(
  gameState: GameState,
  npcIndex: number,
  difficulty: Difficulty
): { action: PlayerAction; amount: number } {
  switch (difficulty) {
    case 'easy':
      return easyAction(gameState, npcIndex);
    case 'medium':
      return mediumAction(gameState, npcIndex);
    case 'hard':
      return hardAction(gameState, npcIndex);
  }
}
