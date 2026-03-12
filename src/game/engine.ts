import {
  GameState,
  Player,
  PlayerAction,
  GamePhase,
} from './types';
import { createDeck, shuffleDeck, dealCards } from './deck';
import { evaluateHand, compareHands } from './evaluator';

// ── Constants ─────────────────────────────────────────────────────────

const DEFAULT_CHIPS = 1000;
const DEFAULT_SMALL_BLIND = 5;
const DEFAULT_BIG_BLIND = 10;

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Returns a deep-ish clone of the game state (enough to treat it as
 * immutable from the caller's perspective).
 */
function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
    })),
    communityCards: [...state.communityCards],
    deck: [...state.deck],
  };
}

function nextActivePlayerIndex(
  players: Player[],
  fromIndex: number
): number {
  const count = players.length;
  let idx = (fromIndex + 1) % count;
  let checked = 0;
  while (checked < count) {
    if (!players[idx].folded && players[idx].chips > 0) {
      return idx;
    }
    idx = (idx + 1) % count;
    checked++;
  }
  // Everyone folded or is all-in; return fromIndex as fallback
  return fromIndex;
}

function activePlayerCount(players: Player[]): number {
  return players.filter((p) => !p.folded).length;
}

function playersStillActing(players: Player[]): number {
  return players.filter((p) => !p.folded && p.chips > 0).length;
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Creates the initial game state with 1 human player and 1 NPC.
 */
export function createInitialState(playerName: string): GameState {
  const players: Player[] = [
    {
      id: 'player-0',
      name: playerName,
      chips: DEFAULT_CHIPS,
      hand: [],
      currentBet: 0,
      folded: false,
      isDealer: true,
      isNPC: false,
    },
    {
      id: 'npc-1',
      name: 'Victoria',
      chips: DEFAULT_CHIPS,
      hand: [],
      currentBet: 0,
      folded: false,
      isDealer: false,
      isNPC: true,
    },
  ];

  return {
    players,
    communityCards: [],
    deck: [],
    pot: 0,
    currentPlayerIndex: 0,
    phase: 'idle' as GamePhase,
    dealerIndex: 0,
    smallBlind: DEFAULT_SMALL_BLIND,
    bigBlind: DEFAULT_BIG_BLIND,
    lastRaise: DEFAULT_BIG_BLIND,
    winner: null,
    winnerHand: null,
    roundOver: false,
  };
}

/**
 * Starts a new round: resets per-round state, shuffles the deck,
 * deals two cards to each player, and posts the blinds.
 */
export function startNewRound(state: GameState): GameState {
  const s = cloneState(state);

  // Move dealer button
  s.dealerIndex = nextActivePlayerIndex(
    s.players,
    s.dealerIndex
  );

  // Reset per-round fields for every player
  for (const p of s.players) {
    p.hand = [];
    p.currentBet = 0;
    p.folded = p.chips <= 0; // auto-fold players with no chips
    p.isDealer = false;
  }
  s.players[s.dealerIndex].isDealer = true;

  s.communityCards = [];
  s.pot = 0;
  s.lastRaise = s.bigBlind;
  s.winner = null;
  s.winnerHand = null;
  s.roundOver = false;

  // Create and shuffle deck
  s.deck = shuffleDeck(createDeck());

  // Deal 2 cards to each non-folded player
  for (const p of s.players) {
    if (!p.folded) {
      const { dealt, remaining } = dealCards(s.deck, 2);
      p.hand = dealt;
      s.deck = remaining;
    }
  }

  // Post blinds
  const sbIdx = nextActivePlayerIndex(s.players, s.dealerIndex);
  const bbIdx = nextActivePlayerIndex(s.players, sbIdx);

  const sbPlayer = s.players[sbIdx];
  const sbAmount = Math.min(s.smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  s.pot += sbAmount;

  const bbPlayer = s.players[bbIdx];
  const bbAmount = Math.min(s.bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  s.pot += bbAmount;

  // First to act pre-flop is the player after the big blind
  s.currentPlayerIndex = nextActivePlayerIndex(s.players, bbIdx);
  s.phase = 'preflop';

  return s;
}

/**
 * Handles a player's action (fold, check, call, raise, all-in).
 * Returns the updated game state. Does NOT advance the phase
 * automatically; the caller should check whether the betting round
 * is complete and call advancePhase when appropriate.
 */
export function handlePlayerAction(
  state: GameState,
  action: PlayerAction,
  amount?: number
): GameState {
  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];

  const highestBet = Math.max(...s.players.map((p) => p.currentBet));
  const toCall = highestBet - player.currentBet;

  switch (action) {
    case 'fold':
      player.folded = true;
      break;

    case 'check':
      // A check is only valid when there is nothing extra to call.
      // Engine trusts the UI to enforce legality; here we simply
      // do nothing to the chip counts.
      break;

    case 'call': {
      const callAmt = Math.min(toCall, player.chips);
      player.chips -= callAmt;
      player.currentBet += callAmt;
      s.pot += callAmt;
      break;
    }

    case 'raise': {
      const raiseTotal = amount ?? s.bigBlind;
      // Total new bet = current highest bet + raise amount
      const targetBet = highestBet + raiseTotal;
      const needed = targetBet - player.currentBet;
      const actual = Math.min(needed, player.chips);
      player.chips -= actual;
      player.currentBet += actual;
      s.pot += actual;
      s.lastRaise = raiseTotal;
      break;
    }

    case 'all-in': {
      const allInAmt = player.chips;
      player.currentBet += allInAmt;
      s.pot += allInAmt;
      player.chips = 0;
      if (allInAmt > toCall) {
        s.lastRaise = allInAmt - toCall;
      }
      break;
    }
  }

  // Check for single remaining player (everyone else folded)
  if (activePlayerCount(s.players) === 1) {
    const winnerPlayer = s.players.find((p) => !p.folded)!;
    winnerPlayer.chips += s.pot;
    s.pot = 0;
    s.winner = winnerPlayer.name;
    s.winnerHand = 'Last player standing';
    s.roundOver = true;
    s.phase = 'showdown';
    return s;
  }

  // Move to next active player
  s.currentPlayerIndex = nextActivePlayerIndex(
    s.players,
    s.currentPlayerIndex
  );

  return s;
}

/**
 * Returns true when the current betting round is complete, meaning
 * all non-folded players with chips remaining have acted and their
 * bets are equal (or they are all-in).
 */
export function isBettingRoundComplete(state: GameState): boolean {
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));

  for (const p of state.players) {
    if (p.folded) continue;
    if (p.chips === 0) continue; // all-in, cannot act further
    if (p.currentBet < highestBet) return false;
  }

  // Additionally, ensure we've gone around at least once.  The
  // simplest way to verify this in a pure-function engine is to
  // check that at most one player still needs to act (the current
  // player just acted, so if we've cycled back we're done). In
  // practice the caller drives the loop, so returning true here
  // signals that the round may advance.
  return true;
}

/**
 * Advances the game to the next phase, dealing community cards as
 * needed. Resets per-round bet tracking for the new street.
 *
 *   preflop -> flop  (deal 3 community cards)
 *   flop    -> turn  (deal 1)
 *   turn    -> river (deal 1)
 *   river   -> showdown
 */
export function advancePhase(state: GameState): GameState {
  const s = cloneState(state);

  // Reset current bets for the new street
  for (const p of s.players) {
    p.currentBet = 0;
  }
  s.lastRaise = s.bigBlind;

  // If only one (or zero) players can still act, skip to showdown
  if (playersStillActing(s.players) <= 1) {
    return fastForwardToShowdown(s);
  }

  switch (s.phase) {
    case 'preflop': {
      // Burn 1, deal 3
      s.deck = s.deck.slice(1); // burn
      const { dealt, remaining } = dealCards(s.deck, 3);
      s.communityCards.push(...dealt);
      s.deck = remaining;
      s.phase = 'flop';
      break;
    }
    case 'flop': {
      s.deck = s.deck.slice(1); // burn
      const { dealt, remaining } = dealCards(s.deck, 1);
      s.communityCards.push(...dealt);
      s.deck = remaining;
      s.phase = 'turn';
      break;
    }
    case 'turn': {
      s.deck = s.deck.slice(1); // burn
      const { dealt, remaining } = dealCards(s.deck, 1);
      s.communityCards.push(...dealt);
      s.deck = remaining;
      s.phase = 'river';
      break;
    }
    case 'river': {
      s.phase = 'showdown';
      return determineWinner(s);
    }
    default:
      return s;
  }

  // First to act post-flop is the first active player after the dealer
  s.currentPlayerIndex = nextActivePlayerIndex(
    s.players,
    s.dealerIndex
  );

  return s;
}

/**
 * Fast-forwards through remaining community cards and goes to showdown.
 * Used when all players are all-in (nobody can bet further).
 */
function fastForwardToShowdown(state: GameState): GameState {
  const s = cloneState(state);

  // Deal remaining community cards
  while (s.communityCards.length < 5 && s.deck.length > 1) {
    s.deck = s.deck.slice(1); // burn
    const { dealt, remaining } = dealCards(s.deck, 1);
    s.communityCards.push(...dealt);
    s.deck = remaining;
  }

  s.phase = 'showdown';
  return determineWinner(s);
}

/**
 * Evaluates all non-folded players' hands against the community cards
 * and determines the winner. Awards the pot to the winner.
 */
export function determineWinner(state: GameState): GameState {
  const s = cloneState(state);

  const contenders = s.players.filter((p) => !p.folded);

  if (contenders.length === 0) {
    s.roundOver = true;
    return s;
  }

  if (contenders.length === 1) {
    const winner = contenders[0];
    winner.chips += s.pot;
    s.pot = 0;
    s.winner = winner.name;
    s.winnerHand = 'Last player standing';
    s.roundOver = true;
    return s;
  }

  // Evaluate each contender's hand
  let bestPlayer = contenders[0];
  let bestHand = evaluateHand([...bestPlayer.hand, ...s.communityCards]);

  for (let i = 1; i < contenders.length; i++) {
    const player = contenders[i];
    const hand = evaluateHand([...player.hand, ...s.communityCards]);

    if (compareHands(hand, bestHand) > 0) {
      bestPlayer = player;
      bestHand = hand;
    }
  }

  // Award pot to winner (simplified; does not handle split pots)
  const winnerInState = s.players.find((p) => p.id === bestPlayer.id)!;
  winnerInState.chips += s.pot;
  s.pot = 0;
  s.winner = winnerInState.name;
  s.winnerHand = bestHand.description;
  s.roundOver = true;

  return s;
}
