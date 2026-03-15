export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRank =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

export interface HandResult {
  rank: HandRank;
  value: number; // numeric rank 0-9, Royal Flush = 9
  cards: Card[]; // best 5 cards
  description: string;
}

export type GamePhase = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  chips: number;
  hand: Card[];
  currentBet: number;
  folded: boolean;
  isDealer: boolean;
  isNPC: boolean;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  deck: Card[];
  pot: number;
  currentPlayerIndex: number;
  phase: GamePhase;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  lastRaise: number;
  winner: string | null;
  winnerHand: string | null;
  roundOver: boolean;
}

// === Event-Driven Architecture & Strip Mechanic Types ===

// Character personality for AI behavior
export type Personality = 'tease' | 'shy' | 'cocky';

// Character definition
export interface Character {
  id: string;
  displayName: string;
  personality: Personality;
  totalLayers: number;       // total clothing layers (6)
  currentLayer: number;      // current layer (1 = fully clothed, 6 = final)
  handsWon: number;
  handsLost: number;
}

// Game event types for animation system
export type GameEventType =
  | 'ROUND_START'
  | 'BLINDS_POSTED'
  | 'CARDS_DEALT'
  | 'PLAYER_ACTION'
  | 'PHASE_CHANGE'
  | 'COMMUNITY_DEALT'
  | 'SHOWDOWN'
  | 'HAND_RESULT'
  | 'POT_AWARDED'
  | 'STRIP_TRIGGER'
  | 'LAYER_CHANGE'
  | 'GAME_OVER'
  | 'DIALOGUE';

// Game event payload
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  payload: Record<string, unknown>;
}

// Extended game state with events and character tracking
export interface ExtendedGameState extends GameState {
  character: Character;      // the opponent character
  roundNumber: number;
  events: GameEvent[];       // events emitted this round (for animation queue)
  gameOver: boolean;
  gameOverReason?: 'player_broke' | 'opponent_broke' | 'opponent_stripped';
}
