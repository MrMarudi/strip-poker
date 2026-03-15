'use client';

import { useState, useCallback, useRef } from 'react';
import { TIMING } from './specs';
import type { Card, GamePhase } from '@/game/types';

// Re-export imported types so consumers can use them without additional imports
export type { Card, GamePhase };

export type CardAnimationPhase =
  | 'idle'          // no animation
  | 'dealing'       // cards being dealt
  | 'revealing'     // community cards being revealed
  | 'highlighting'  // winning hand glowing
  | 'cleaning';     // cards sliding off screen

export interface CardAnimationState {
  phase: CardAnimationPhase;
  // Player hole cards
  playerCardsVisible: boolean;
  playerCardsFaceUp: boolean;
  // Opponent hole cards
  opponentCardsVisible: boolean;
  opponentCardsFaceUp: boolean;
  // Community cards
  revealedCommunityCount: number;  // 0, 3 (flop), 4 (turn), 5 (river)
  // Highlight
  highlightedCardIndices: number[]; // indices of winning cards in community
  highlightPlayerHand: boolean;
  highlightOpponentHand: boolean;
}

const INITIAL_STATE: CardAnimationState = {
  phase: 'idle',
  playerCardsVisible: false,
  playerCardsFaceUp: false,
  opponentCardsVisible: false,
  opponentCardsFaceUp: false,
  revealedCommunityCount: 0,
  highlightedCardIndices: [],
  highlightPlayerHand: false,
  highlightOpponentHand: false,
};

export interface CardSoundHooks {
  onDeal?: () => void;
  onFlip?: () => void;
  onReveal?: () => void;
}

export function useCardAnimations(soundHooks?: CardSoundHooks) {
  const [state, setState] = useState<CardAnimationState>(INITIAL_STATE);
  const cancelRef = useRef(false);

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  // Deal hole cards to both players (staggered)
  const dealHoleCards = useCallback(async () => {
    cancelRef.current = false;
    setState(s => ({ ...s, phase: 'dealing' }));

    soundHooks?.onDeal?.();

    // Deal opponent cards (face down) first
    setState(s => ({ ...s, opponentCardsVisible: true, opponentCardsFaceUp: false }));
    await wait(TIMING.card.stagger * 1000 * 2); // 2 cards stagger

    if (cancelRef.current) return;

    // Deal player cards (face up)
    soundHooks?.onDeal?.();
    setState(s => ({ ...s, playerCardsVisible: true, playerCardsFaceUp: true }));
    await wait(TIMING.card.deal * 1000);

    if (cancelRef.current) return;
    setState(s => ({ ...s, phase: 'idle' }));
  }, [soundHooks]);

  // Reveal community cards (flop = 3, turn = 4, river = 5)
  const revealCommunityCards = useCallback(async (count: 3 | 4 | 5) => {
    cancelRef.current = false;
    setState(s => ({ ...s, phase: 'revealing' }));

    soundHooks?.onReveal?.();

    if (count === 3) {
      // Flop: reveal 3 with stagger
      for (let i = 1; i <= 3; i++) {
        if (cancelRef.current) return;
        setState(s => ({ ...s, revealedCommunityCount: i }));
        await wait(200); // stagger between flop cards
      }
    } else {
      // Turn or river: single card
      setState(s => ({ ...s, revealedCommunityCount: count }));
    }

    await wait(TIMING.card.flip * 1000);

    if (cancelRef.current) return;
    setState(s => ({ ...s, phase: 'idle' }));
  }, [soundHooks]);

  // Reveal opponent cards at showdown
  const revealOpponentCards = useCallback(async () => {
    cancelRef.current = false;
    soundHooks?.onFlip?.();
    setState(s => ({ ...s, opponentCardsFaceUp: true }));
    await wait(TIMING.card.flip * 1000);
  }, [soundHooks]);

  // Highlight winning hand
  const highlightWinningHand = useCallback(async (
    winnerIsPlayer: boolean,
    communityIndices?: number[], // which community cards are part of winning hand
  ) => {
    setState(s => ({
      ...s,
      phase: 'highlighting',
      highlightPlayerHand: winnerIsPlayer,
      highlightOpponentHand: !winnerIsPlayer,
      highlightedCardIndices: communityIndices || [],
    }));

    // Hold highlight for 2 seconds
    await wait(2000);

    if (cancelRef.current) return;
    setState(s => ({
      ...s,
      phase: 'idle',
      highlightPlayerHand: false,
      highlightOpponentHand: false,
      highlightedCardIndices: [],
    }));
  }, []);

  // Clean up cards between rounds
  const cleanupCards = useCallback(async () => {
    cancelRef.current = false;
    setState(s => ({ ...s, phase: 'cleaning' }));
    await wait(400); // cleanup animation duration

    if (cancelRef.current) return;
    setState(INITIAL_STATE);
  }, []);

  // Cancel all animations and reset
  const cancelAnimations = useCallback(() => {
    cancelRef.current = true;
    setState(INITIAL_STATE);
  }, []);

  return {
    cardState: state,
    dealHoleCards,
    revealCommunityCards,
    revealOpponentCards,
    highlightWinningHand,
    cleanupCards,
    cancelAnimations,
  };
}
