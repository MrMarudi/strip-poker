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
