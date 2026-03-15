import {
  GameState,
  PlayerAction,
  Difficulty,
  Card,
} from './types';
import { evaluateHand } from './evaluator';
import { getDialogue, DialogueSituation } from './dialogue';

// ── Personality Profiles ─────────────────────────────────────────────

export interface PersonalityProfile {
  bluffFrequency: number;      // 0-1, how often to bluff
  foldThreshold: number;       // 0-1, fold when hand strength below this
  aggressionFactor: number;    // 0-1, tendency to raise vs call
  riskTolerance: number;       // 0-1, willingness to risk chips
  slowPlayThreshold: number;   // 0-1, when to slow-play strong hands
  betSizeMultiplier: number;   // multiplier on bet sizing (0.5 = small, 2.0 = big)
}

export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  luna: {
    bluffFrequency: 0.35,
    foldThreshold: 0.2,
    aggressionFactor: 0.5,
    riskTolerance: 0.6,
    slowPlayThreshold: 0.8,
    betSizeMultiplier: 1.0,
  },
  sakura: {
    bluffFrequency: 0.08,
    foldThreshold: 0.45,
    aggressionFactor: 0.2,
    riskTolerance: 0.3,
    slowPlayThreshold: 0.95,
    betSizeMultiplier: 0.7,
  },
  valentina: {
    bluffFrequency: 0.25,
    foldThreshold: 0.15,
    aggressionFactor: 0.75,
    riskTolerance: 0.8,
    slowPlayThreshold: 0.85,
    betSizeMultiplier: 1.5,
  },
  emma: {
    bluffFrequency: 0.3,
    foldThreshold: 0.25,
    aggressionFactor: 0.4,
    riskTolerance: 0.5,
    slowPlayThreshold: 0.7,
    betSizeMultiplier: 0.9,
  },
  zara: {
    bluffFrequency: 0.2,
    foldThreshold: 0.1,
    aggressionFactor: 0.85,
    riskTolerance: 0.9,
    slowPlayThreshold: 0.9,
    betSizeMultiplier: 1.8,
  },
};

// ── Hand Strength Helpers ────────────────────────────────────────────

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
    return getPreflopStrength(hand);
  }

  const result = evaluateHand(allCards);

  const base = result.value / 9;
  const kickerBonus =
    result.cards.reduce((sum, c) => sum + cardNumericValue(c), 0) /
    (14 * 5) *
    0.1;

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
    score = 0.45 + ((high - 2) / 12) * 0.5;
  } else {
    score = (high + low) / 28 * 0.5;
    const gap = high - low;
    if (gap === 1) score += 0.05;
    else if (gap === 2) score += 0.03;
    if (suited) score += 0.06;
    if (high >= 13) score += 0.05;
    if (low >= 13) score += 0.05;
  }

  return Math.min(Math.max(score, 0), 1);
}

// ── Cost Helpers ─────────────────────────────────────────────────────

function costToCall(state: GameState, playerIndex: number): number {
  const player = state.players[playerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  return Math.max(0, highestBet - player.currentBet);
}

function canCheck(state: GameState, playerIndex: number): boolean {
  return costToCall(state, playerIndex) === 0;
}

// ── Difficulty Modifiers ─────────────────────────────────────────────

function applyDifficultyModifiers(
  profile: PersonalityProfile,
  difficulty: Difficulty
): PersonalityProfile {
  const p = { ...profile };

  switch (difficulty) {
    case 'easy':
      p.bluffFrequency = Math.min(1, p.bluffFrequency + 0.15);
      p.foldThreshold = Math.max(0, p.foldThreshold - 0.1);
      // Easy bots are sloppier: slightly lower aggression precision
      p.aggressionFactor = Math.max(0, p.aggressionFactor - 0.1);
      break;
    case 'medium':
      // Use base profile as-is
      break;
    case 'hard':
      p.foldThreshold = Math.min(1, p.foldThreshold + 0.05);
      // Hard bots bluff less recklessly
      p.bluffFrequency = Math.max(0, p.bluffFrequency - 0.05);
      // Slightly sharper aggression
      p.aggressionFactor = Math.min(1, p.aggressionFactor + 0.05);
      break;
  }

  return p;
}

// ── Dialogue Selection ───────────────────────────────────────────────

function pickDialogue(
  characterId: string,
  action: PlayerAction,
  strength: number,
  isBluff: boolean
): string | null {
  // Only produce dialogue ~40% of the time to avoid spam
  if (Math.random() > 0.4) return null;

  let situation: DialogueSituation;

  if (isBluff) {
    situation = 'bluff';
  } else if (action === 'fold') {
    situation = 'fold';
  } else if (action === 'all-in') {
    situation = 'allIn';
  } else if (action === 'raise') {
    situation = strength > 0.7 ? 'confident' : 'raise';
  } else if (action === 'call') {
    situation = strength < 0.3 ? 'nervous' : 'call';
  } else {
    // check — use taunt or confident based on hand
    if (strength > 0.7) {
      situation = 'confident';
    } else if (strength < 0.25) {
      situation = 'nervous';
    } else {
      situation = Math.random() < 0.5 ? 'taunt' : 'call';
    }
  }

  return getDialogue(characterId, situation);
}

// ── Personality-Driven Decision Engine ───────────────────────────────

function personalityAction(
  state: GameState,
  npcIndex: number,
  profile: PersonalityProfile,
  characterId: string,
  difficulty: Difficulty
): { action: PlayerAction; amount: number; dialogue?: string } {
  const player = state.players[npcIndex];
  const call = costToCall(state, npcIndex);
  const strength = getHandStrength(player.hand, state.communityCards);
  const potOdds = call > 0 ? call / (state.pot + call) : 0;

  const activePlayers = state.players.filter((p) => !p.folded).length;
  // Adjust strength downward with more opponents (multiway pots)
  const adjustedStrength = strength * (1 - (activePlayers - 2) * 0.03);

  // Easy difficulty adds randomness to decisions
  const randomNoise = difficulty === 'easy' ? (Math.random() - 0.5) * 0.15 : 0;
  const effectiveStrength = Math.max(0, Math.min(1, adjustedStrength + randomNoise));

  const roll = Math.random();
  let isBluff = false;

  // ── Bluff Detection ────────────────────────────────────────────
  // Street-dependent bluff scaling: bluffs become less frequent on later streets
  const streetBluffScale =
    state.phase === 'preflop' ? 0.8 :
    state.phase === 'flop' ? 1.0 :
    state.phase === 'turn' ? 1.1 :
    1.2; // river bluffs are slightly more common (semi-rational)

  const shouldBluff =
    effectiveStrength < profile.foldThreshold &&
    roll < profile.bluffFrequency * streetBluffScale;

  // ── Slow-play Detection ────────────────────────────────────────
  const shouldSlowPlay =
    effectiveStrength > profile.slowPlayThreshold &&
    roll < (1 - profile.aggressionFactor) * 0.4;

  // ── Free Check Scenario ────────────────────────────────────────
  if (canCheck(state, npcIndex)) {
    // Strong hand: bet for value (unless slow-playing)
    if (effectiveStrength > 0.6 && !shouldSlowPlay) {
      const sizeFactor = effectiveStrength > 0.8
        ? 0.75 * profile.betSizeMultiplier
        : 0.5 * profile.betSizeMultiplier;
      const raiseAmt = Math.max(
        state.bigBlind,
        Math.floor(state.pot * sizeFactor)
      );
      if (player.chips >= raiseAmt) {
        // Use aggression factor to decide between raise and check
        if (roll < profile.aggressionFactor) {
          const dialogue = pickDialogue(characterId, 'raise', strength, false);
          return { action: 'raise', amount: raiseAmt, dialogue: dialogue ?? undefined };
        }
      }
    }

    // Slow-playing a monster: just check
    if (shouldSlowPlay) {
      const dialogue = pickDialogue(characterId, 'check', strength, false);
      return { action: 'check', amount: 0, dialogue: dialogue ?? undefined };
    }

    // Bluff: bet with a weak hand
    if (shouldBluff) {
      isBluff = true;
      const bluffSize = Math.max(
        state.bigBlind,
        Math.floor(state.pot * 0.6 * profile.betSizeMultiplier)
      );
      if (player.chips >= bluffSize) {
        const dialogue = pickDialogue(characterId, 'raise', strength, true);
        return { action: 'raise', amount: bluffSize, dialogue: dialogue ?? undefined };
      }
    }

    // Medium hand: occasional small bet based on aggression
    if (effectiveStrength > 0.4 && roll < profile.aggressionFactor * 0.5) {
      const raiseAmt = Math.max(
        state.bigBlind,
        Math.floor(state.pot * 0.4 * profile.betSizeMultiplier)
      );
      if (player.chips >= raiseAmt) {
        const dialogue = pickDialogue(characterId, 'raise', strength, false);
        return { action: 'raise', amount: raiseAmt, dialogue: dialogue ?? undefined };
      }
    }

    const dialogue = pickDialogue(characterId, 'check', strength, false);
    return { action: 'check', amount: 0, dialogue: dialogue ?? undefined };
  }

  // ── Facing a Bet ───────────────────────────────────────────────

  // Very strong hand: re-raise
  if (effectiveStrength > 0.8) {
    const raiseAmt = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.75 * profile.betSizeMultiplier)
    );

    if (roll < profile.aggressionFactor) {
      // All-in with monsters when risk tolerance is high
      if (effectiveStrength > 0.9 && roll < profile.riskTolerance * 0.5) {
        if (player.chips <= call) {
          const dialogue = pickDialogue(characterId, 'all-in', strength, false);
          return { action: 'all-in', amount: player.chips, dialogue: dialogue ?? undefined };
        }
        const dialogue = pickDialogue(characterId, 'all-in', strength, false);
        return { action: 'all-in', amount: player.chips, dialogue: dialogue ?? undefined };
      }

      if (player.chips >= call + raiseAmt) {
        const dialogue = pickDialogue(characterId, 'raise', strength, false);
        return { action: 'raise', amount: raiseAmt, dialogue: dialogue ?? undefined };
      }
    }

    // Can't raise enough, just call
    if (player.chips <= call) {
      const dialogue = pickDialogue(characterId, 'all-in', strength, false);
      return { action: 'all-in', amount: player.chips, dialogue: dialogue ?? undefined };
    }
    const dialogue = pickDialogue(characterId, 'call', strength, false);
    return { action: 'call', amount: call, dialogue: dialogue ?? undefined };
  }

  // Bluff re-raise with a weak hand
  if (shouldBluff) {
    isBluff = true;
    const bluffRaise = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.65 * profile.betSizeMultiplier)
    );
    if (player.chips >= call + bluffRaise) {
      const dialogue = pickDialogue(characterId, 'raise', strength, true);
      return { action: 'raise', amount: bluffRaise, dialogue: dialogue ?? undefined };
    }
  }

  // Hand too weak: fold based on threshold + pot odds
  if (effectiveStrength < profile.foldThreshold && !shouldBluff) {
    // Even weak folders stay in sometimes based on risk tolerance
    if (roll > profile.riskTolerance) {
      const dialogue = pickDialogue(characterId, 'fold', strength, false);
      return { action: 'fold', amount: 0, dialogue: dialogue ?? undefined };
    }
  }

  // Decent hand: check pot odds
  if (effectiveStrength < potOdds + 0.05 && effectiveStrength < 0.5) {
    // Loose players (low foldThreshold, high riskTolerance) call anyway
    if (roll > profile.riskTolerance) {
      const dialogue = pickDialogue(characterId, 'fold', strength, false);
      return { action: 'fold', amount: 0, dialogue: dialogue ?? undefined };
    }
  }

  // Medium-strong hand: raise sometimes based on aggression
  if (effectiveStrength > 0.55 && roll < profile.aggressionFactor * 0.6) {
    const raiseAmt = Math.max(
      state.bigBlind,
      Math.floor(state.pot * 0.5 * profile.betSizeMultiplier)
    );
    if (player.chips >= call + raiseAmt) {
      const dialogue = pickDialogue(characterId, 'raise', strength, false);
      return { action: 'raise', amount: raiseAmt, dialogue: dialogue ?? undefined };
    }
  }

  // All-in decision when call would take most of our chips
  if (call >= player.chips) {
    const allInThreshold = 0.3 + profile.riskTolerance * 0.3;
    if (effectiveStrength > allInThreshold) {
      const dialogue = pickDialogue(characterId, 'all-in', strength, false);
      return { action: 'all-in', amount: player.chips, dialogue: dialogue ?? undefined };
    }
    const dialogue = pickDialogue(characterId, 'fold', strength, false);
    return { action: 'fold', amount: 0, dialogue: dialogue ?? undefined };
  }

  // Default: call
  const dialogue = pickDialogue(characterId, 'call', strength, false);
  return { action: 'call', amount: call, dialogue: dialogue ?? undefined };
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Returns the action, amount, and optional dialogue an NPC should take
 * given the current game state, the NPC's index, and the chosen
 * difficulty level.
 *
 * When a characterId is provided, the NPC uses a personality-driven
 * decision engine. Otherwise falls back to a default balanced profile.
 */
export function getNPCAction(
  gameState: GameState,
  npcIndex: number,
  difficulty: Difficulty,
  characterId?: string
): { action: PlayerAction; amount: number; dialogue?: string } {
  // Resolve character ID: use provided value, try to infer from player id, or default
  const resolvedId = characterId
    ?? inferCharacterId(gameState.players[npcIndex]?.name)
    ?? 'luna';

  const baseProfile = PERSONALITY_PROFILES[resolvedId.toLowerCase()]
    ?? PERSONALITY_PROFILES.luna;

  const profile = applyDifficultyModifiers(baseProfile, difficulty);

  return personalityAction(gameState, npcIndex, profile, resolvedId.toLowerCase(), difficulty);
}

/**
 * Attempt to infer a character ID from the NPC's display name.
 */
function inferCharacterId(name?: string): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  const knownIds = ['luna', 'sakura', 'valentina', 'emma', 'zara'];
  return knownIds.find((id) => lower.includes(id)) ?? null;
}
