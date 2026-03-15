import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards } from '../deck';
import { evaluateHand, compareHands } from '../evaluator';
import {
  createInitialState,
  createExtendedState,
  startNewRound,
  handlePlayerAction,
  advancePhase,
  isBettingRoundComplete,
  processStripTrigger,
  checkGameOver,
} from '../engine';
import { getNPCAction } from '../npc';
import {
  getCurrentLayer,
  getNextLayer,
  isGameOver,
  TOTAL_LAYERS,
} from '../stripMechanic';
import { createEvent, emitEvent, clearEvents } from '../events';
import { getDialogue } from '../dialogue';
import type { Card, Suit, Character, ExtendedGameState } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────

function makeCard(rank: Card['rank'], suit: Suit): Card {
  return { rank, suit };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'luna',
    displayName: 'Luna',
    personality: 'tease',
    totalLayers: 6,
    currentLayer: 1,
    handsWon: 0,
    handsLost: 0,
    ...overrides,
  };
}

// =====================================================================
// 1. Deck tests
// =====================================================================

describe('Deck', () => {
  it('createDeck returns 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    // All cards should be unique (suit+rank combos)
    const keys = deck.map((c) => `${c.rank}-${c.suit}`);
    expect(new Set(keys).size).toBe(52);
  });

  it('shuffleDeck produces a different order (probabilistic)', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    // The shuffled deck should not be identical to the original
    // (extremely unlikely with Fisher-Yates on 52 cards)
    const sameOrder = deck.every(
      (c, i) => c.rank === shuffled[i].rank && c.suit === shuffled[i].suit
    );
    expect(sameOrder).toBe(false);
  });

  it('shuffleDeck does not mutate the original deck', () => {
    const deck = createDeck();
    const copy = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(copy);
  });

  it('dealCards removes cards from the deck', () => {
    const deck = createDeck();
    const { dealt, remaining } = dealCards(deck, 5);
    expect(dealt).toHaveLength(5);
    expect(remaining).toHaveLength(47);
    // dealt cards are the first 5 in the deck
    expect(dealt).toEqual(deck.slice(0, 5));
  });

  it('dealCards throws when requesting more cards than available', () => {
    const deck = createDeck();
    expect(() => dealCards(deck, 53)).toThrow();
  });
});

// =====================================================================
// 2. Hand evaluation tests
// =====================================================================

describe('Hand Evaluation', () => {
  it('identifies a flush', () => {
    const cards: Card[] = [
      makeCard('2', 'hearts'),
      makeCard('5', 'hearts'),
      makeCard('8', 'hearts'),
      makeCard('J', 'hearts'),
      makeCard('A', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Flush');
    expect(result.value).toBe(5);
  });

  it('identifies one pair', () => {
    const cards: Card[] = [
      makeCard('K', 'hearts'),
      makeCard('K', 'spades'),
      makeCard('3', 'diamonds'),
      makeCard('7', 'clubs'),
      makeCard('9', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('One Pair');
    expect(result.value).toBe(1);
  });

  it('identifies a straight', () => {
    const cards: Card[] = [
      makeCard('5', 'hearts'),
      makeCard('6', 'diamonds'),
      makeCard('7', 'clubs'),
      makeCard('8', 'spades'),
      makeCard('9', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Straight');
    expect(result.value).toBe(4);
  });

  it('identifies a full house', () => {
    const cards: Card[] = [
      makeCard('Q', 'hearts'),
      makeCard('Q', 'diamonds'),
      makeCard('Q', 'clubs'),
      makeCard('7', 'spades'),
      makeCard('7', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Full House');
    expect(result.value).toBe(6);
  });

  it('identifies four of a kind', () => {
    const cards: Card[] = [
      makeCard('A', 'hearts'),
      makeCard('A', 'diamonds'),
      makeCard('A', 'clubs'),
      makeCard('A', 'spades'),
      makeCard('2', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Four of a Kind');
    expect(result.value).toBe(7);
  });

  it('identifies a royal flush', () => {
    const cards: Card[] = [
      makeCard('10', 'spades'),
      makeCard('J', 'spades'),
      makeCard('Q', 'spades'),
      makeCard('K', 'spades'),
      makeCard('A', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Royal Flush');
    expect(result.value).toBe(9);
  });

  it('identifies high card', () => {
    const cards: Card[] = [
      makeCard('2', 'hearts'),
      makeCard('5', 'diamonds'),
      makeCard('8', 'clubs'),
      makeCard('J', 'spades'),
      makeCard('A', 'hearts'),
    ];
    // Not a flush (mixed suits), not a straight
    const result = evaluateHand(cards);
    expect(result.rank).toBe('High Card');
    expect(result.value).toBe(0);
  });

  it('picks the best 5 from 7 cards', () => {
    // 7 cards containing a flush in hearts
    const cards: Card[] = [
      makeCard('2', 'hearts'),
      makeCard('5', 'hearts'),
      makeCard('8', 'hearts'),
      makeCard('J', 'hearts'),
      makeCard('A', 'hearts'),
      makeCard('3', 'clubs'),
      makeCard('K', 'diamonds'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Flush');
  });

  it('compareHands ranks a flush above a pair', () => {
    const flush = evaluateHand([
      makeCard('2', 'hearts'),
      makeCard('5', 'hearts'),
      makeCard('8', 'hearts'),
      makeCard('J', 'hearts'),
      makeCard('A', 'hearts'),
    ]);
    const pair = evaluateHand([
      makeCard('K', 'hearts'),
      makeCard('K', 'spades'),
      makeCard('3', 'diamonds'),
      makeCard('7', 'clubs'),
      makeCard('9', 'hearts'),
    ]);
    expect(compareHands(flush, pair)).toBeGreaterThan(0);
  });

  it('identifies ace-low straight (wheel)', () => {
    const cards: Card[] = [
      makeCard('A', 'hearts'),
      makeCard('2', 'diamonds'),
      makeCard('3', 'clubs'),
      makeCard('4', 'spades'),
      makeCard('5', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe('Straight');
  });
});

// =====================================================================
// 3. Engine basic flow
// =====================================================================

describe('Engine basic flow', () => {
  it('createInitialState sets up 2 players in idle phase', () => {
    const state = createInitialState('Alice');
    expect(state.players).toHaveLength(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[0].isNPC).toBe(false);
    expect(state.players[1].isNPC).toBe(true);
    expect(state.phase).toBe('idle');
    expect(state.pot).toBe(0);
  });

  it('startNewRound transitions to preflop with cards dealt', () => {
    const initial = createInitialState('Alice');
    const round = startNewRound(initial);
    expect(round.phase).toBe('preflop');
    // Each player should have 2 cards
    expect(round.players[0].hand).toHaveLength(2);
    expect(round.players[1].hand).toHaveLength(2);
    // Blinds should be posted (pot > 0)
    expect(round.pot).toBeGreaterThan(0);
  });

  it('handlePlayerAction (call) does not crash', () => {
    const initial = createInitialState('Alice');
    const round = startNewRound(initial);
    const afterAction = handlePlayerAction(round, 'call');
    expect(afterAction.phase).toBe('preflop');
    // Player should have fewer chips after calling
  });

  it('handlePlayerAction (fold) ends round when only 1 player remains', () => {
    const initial = createInitialState('Alice');
    const round = startNewRound(initial);
    const afterFold = handlePlayerAction(round, 'fold');
    expect(afterFold.roundOver).toBe(true);
    expect(afterFold.winner).toBeTruthy();
  });
});

// =====================================================================
// 4. Complete hand: preflop -> flop -> turn -> river -> showdown
// =====================================================================

describe('Complete hand flow', () => {
  it('plays through preflop -> flop -> turn -> river -> showdown', () => {
    let state = createInitialState('Alice');
    state = startNewRound(state);
    expect(state.phase).toBe('preflop');

    // Preflop: player calls, NPC checks (both even after blinds)
    state = handlePlayerAction(state, 'call'); // player calls BB
    state = handlePlayerAction(state, 'check'); // NPC checks
    expect(isBettingRoundComplete(state)).toBe(true);

    // Advance to flop
    state = advancePhase(state);
    expect(state.phase).toBe('flop');
    expect(state.communityCards).toHaveLength(3);

    // Flop: both check
    state = handlePlayerAction(state, 'check');
    state = handlePlayerAction(state, 'check');

    // Advance to turn
    state = advancePhase(state);
    expect(state.phase).toBe('turn');
    expect(state.communityCards).toHaveLength(4);

    // Turn: both check
    state = handlePlayerAction(state, 'check');
    state = handlePlayerAction(state, 'check');

    // Advance to river
    state = advancePhase(state);
    expect(state.phase).toBe('river');
    expect(state.communityCards).toHaveLength(5);

    // River: both check
    state = handlePlayerAction(state, 'check');
    state = handlePlayerAction(state, 'check');

    // Advance to showdown
    state = advancePhase(state);
    expect(state.phase).toBe('showdown');
    expect(state.roundOver).toBe(true);
    expect(state.winner).toBeTruthy();
    expect(state.winnerHand).toBeTruthy();
    // Pot should be awarded (pot = 0 after distribution)
    expect(state.pot).toBe(0);
  });
});

// =====================================================================
// 5. NPC AI
// =====================================================================

describe('NPC AI', () => {
  const validActions = ['fold', 'check', 'call', 'raise', 'all-in'];

  it('getNPCAction returns a valid action for easy difficulty', () => {
    const state = startNewRound(createInitialState('Alice'));
    const npcIdx = 1;
    const result = getNPCAction(state, npcIdx, 'easy', 'luna');
    expect(validActions).toContain(result.action);
    expect(typeof result.amount).toBe('number');
  });

  it('getNPCAction returns a valid action for medium difficulty', () => {
    const state = startNewRound(createInitialState('Alice'));
    const result = getNPCAction(state, 1, 'medium', 'valentina');
    expect(validActions).toContain(result.action);
  });

  it('getNPCAction returns a valid action for hard difficulty', () => {
    const state = startNewRound(createInitialState('Alice'));
    const result = getNPCAction(state, 1, 'hard', 'zara');
    expect(validActions).toContain(result.action);
  });

  it('getNPCAction works for all known characters', () => {
    const state = startNewRound(createInitialState('Alice'));
    for (const charId of ['luna', 'sakura', 'valentina', 'emma', 'zara']) {
      const result = getNPCAction(state, 1, 'medium', charId);
      expect(validActions).toContain(result.action);
    }
  });

  it('getNPCAction falls back gracefully with unknown character', () => {
    const state = startNewRound(createInitialState('Alice'));
    const result = getNPCAction(state, 1, 'medium', 'unknown_char');
    expect(validActions).toContain(result.action);
  });
});

// =====================================================================
// 6. Strip mechanic
// =====================================================================

describe('Strip Mechanic', () => {
  it('getCurrentLayer returns the character current layer', () => {
    const char = makeCharacter({ currentLayer: 3 });
    expect(getCurrentLayer(char)).toBe(3);
  });

  it('getNextLayer increments the layer by 1', () => {
    const char = makeCharacter({ currentLayer: 2 });
    expect(getNextLayer(char)).toBe(3);
  });

  it('isGameOver returns false when not at final layer', () => {
    const char = makeCharacter({ currentLayer: 3 });
    expect(isGameOver(char)).toBe(false);
  });

  it('isGameOver returns true when at final layer', () => {
    const char = makeCharacter({ currentLayer: TOTAL_LAYERS });
    expect(isGameOver(char)).toBe(true);
  });

  // 7. Edge case: layer clamped to TOTAL_LAYERS
  it('getNextLayer does not exceed TOTAL_LAYERS', () => {
    const char = makeCharacter({ currentLayer: TOTAL_LAYERS });
    expect(getNextLayer(char)).toBe(TOTAL_LAYERS);
  });

  it('getNextLayer clamps at TOTAL_LAYERS when already at max', () => {
    const char = makeCharacter({ currentLayer: TOTAL_LAYERS + 5 });
    // Math.min(currentLayer + 1, TOTAL_LAYERS) — already beyond, so clamp
    expect(getNextLayer(char)).toBe(TOTAL_LAYERS);
  });
});

// =====================================================================
// 7. processStripTrigger and checkGameOver (engine-level strip)
// =====================================================================

describe('processStripTrigger', () => {
  function makeExtendedState(): ExtendedGameState {
    return createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
  }

  it('advances layer when player wins the round', () => {
    let state = makeExtendedState();
    state = startNewRound(state) as ExtendedGameState;

    // In heads-up, dealer rotates to NPC (index 1) on first round.
    // NPC is SB/dealer, player is BB. First to act preflop = NPC.
    // So first handlePlayerAction acts on NPC. NPC folds -> player wins.
    state = handlePlayerAction(state, 'fold') as ExtendedGameState;

    expect(state.roundOver).toBe(true);
    expect(state.winner).toBe('Alice');

    const stripped = processStripTrigger(state);
    expect(stripped.character.currentLayer).toBe(2); // was 1, now 2
    expect(stripped.character.handsLost).toBe(1);
  });

  it('does not advance layer when NPC wins', () => {
    let state = makeExtendedState();
    state = startNewRound(state) as ExtendedGameState;

    // First to act = NPC (dealer/SB in heads-up). NPC calls, then player folds.
    state = handlePlayerAction(state, 'call') as ExtendedGameState; // NPC calls
    state = handlePlayerAction(state, 'fold') as ExtendedGameState; // Player folds
    expect(state.roundOver).toBe(true);
    expect(state.winner).toBe('Luna');

    const result = processStripTrigger(state);
    expect(result.character.currentLayer).toBe(1); // unchanged
    expect(result.character.handsWon).toBe(1);
  });
});

describe('checkGameOver', () => {
  it('detects opponent_stripped when character reaches final layer', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    state.character.currentLayer = TOTAL_LAYERS; // at final layer
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.gameOverReason).toBe('opponent_stripped');
  });

  it('detects player_broke when player has 0 chips', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    state.players[0].chips = 0;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.gameOverReason).toBe('player_broke');
  });

  it('detects opponent_broke when NPC has 0 chips', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    state.players[1].chips = 0;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.gameOverReason).toBe('opponent_broke');
  });

  it('returns unchanged state when game is not over', () => {
    const state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(false);
    expect(result.gameOverReason).toBeUndefined();
  });
});

// =====================================================================
// 8. Dialogue system
// =====================================================================

describe('Dialogue', () => {
  const situations = [
    'win', 'lose', 'bluff', 'fold', 'call', 'raise',
    'allIn', 'taunt', 'nervous', 'confident',
  ] as const;

  const characters = ['luna', 'sakura', 'valentina', 'emma', 'zara'];

  it('getDialogue returns a string for each character and situation', () => {
    for (const charId of characters) {
      for (const situation of situations) {
        const line = getDialogue(charId, situation);
        expect(line).not.toBeNull();
        expect(typeof line).toBe('string');
        expect((line as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('getDialogue returns null for unknown character', () => {
    const line = getDialogue('nonexistent', 'win');
    expect(line).toBeNull();
  });

  it('getDialogue is case-insensitive on character ID', () => {
    const line = getDialogue('LUNA', 'win');
    expect(line).not.toBeNull();
  });
});

// =====================================================================
// 9. Event system
// =====================================================================

describe('Event System', () => {
  it('createEvent produces correct structure', () => {
    const event = createEvent('ROUND_START', { roundNumber: 1 });
    expect(event.type).toBe('ROUND_START');
    expect(event.payload).toEqual({ roundNumber: 1 });
    expect(typeof event.timestamp).toBe('number');
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it('createEvent defaults to empty payload', () => {
    const event = createEvent('GAME_OVER');
    expect(event.payload).toEqual({});
  });

  it('emitEvent appends event to state events array', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    expect(state.events).toHaveLength(0);

    state = emitEvent(state, 'ROUND_START', { roundNumber: 1 });
    expect(state.events).toHaveLength(1);
    expect(state.events[0].type).toBe('ROUND_START');

    state = emitEvent(state, 'CARDS_DEALT', { playerCount: 2 });
    expect(state.events).toHaveLength(2);
    expect(state.events[1].type).toBe('CARDS_DEALT');
  });

  it('emitEvent does not mutate original state', () => {
    const state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    const newState = emitEvent(state, 'ROUND_START', { roundNumber: 1 });
    expect(state.events).toHaveLength(0);
    expect(newState.events).toHaveLength(1);
  });

  it('clearEvents resets the events array', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    state = emitEvent(state, 'ROUND_START', { roundNumber: 1 });
    state = emitEvent(state, 'CARDS_DEALT', { playerCount: 2 });
    expect(state.events).toHaveLength(2);

    state = clearEvents(state);
    expect(state.events).toHaveLength(0);
  });
});

// =====================================================================
// 10. Extended state integration (events emitted during gameplay)
// =====================================================================

describe('Extended state integration', () => {
  it('startNewRound emits ROUND_START, BLINDS_POSTED, CARDS_DEALT events', () => {
    const initial = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    const round = startNewRound(initial) as ExtendedGameState;
    expect(round.events.length).toBeGreaterThanOrEqual(3);

    const types = round.events.map((e) => e.type);
    expect(types).toContain('ROUND_START');
    expect(types).toContain('BLINDS_POSTED');
    expect(types).toContain('CARDS_DEALT');
    expect(round.roundNumber).toBe(1);
  });

  it('handlePlayerAction emits PLAYER_ACTION event on extended state', () => {
    let state = createExtendedState('Alice', 'luna', 'Luna', 'tease', 'medium') as ExtendedGameState;
    state = startNewRound(state) as ExtendedGameState;
    const eventsBefore = state.events.length;

    state = handlePlayerAction(state, 'call') as ExtendedGameState;
    expect(state.events.length).toBeGreaterThan(eventsBefore);

    const lastEvent = state.events[state.events.length - 1];
    expect(lastEvent.type).toBe('PLAYER_ACTION');
  });
});
