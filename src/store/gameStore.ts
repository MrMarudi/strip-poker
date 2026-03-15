'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, GameEvent } from '@/game/types';
import { TOTAL_LAYERS } from '@/game/stripMechanic';

// ── Per-character persistent state ──────────────────────────────────

interface CharacterGameState {
  currentLayer: number;   // 1 = fully clothed, 6 = final
  handsWon: number;
  handsLost: number;
}

// ── Store shape ─────────────────────────────────────────────────────

interface GameStoreState {
  // Selected character
  selectedCharacterId: string | null;
  difficulty: Difficulty;

  // Character states (persisted across sessions)
  characterStates: Record<string, CharacterGameState>;

  // Current game session (NOT persisted)
  roundNumber: number;
  playerChips: number;
  opponentChips: number;
  gameOver: boolean;
  gameOverReason: string | null;

  // Animation event queue (NOT persisted)
  pendingEvents: GameEvent[];

  // ── Actions ─────────────────────────────────────────────────────

  selectCharacter: (id: string) => void;
  setDifficulty: (d: Difficulty) => void;
  advanceLayer: (characterId: string) => void;
  recordHandResult: (characterId: string, won: boolean) => void;
  updateChips: (player: number, opponent: number) => void;
  setRoundNumber: (n: number) => void;
  setGameOver: (reason: string) => void;
  pushEvents: (events: GameEvent[]) => void;
  clearEvents: () => void;
  resetGame: () => void;
  resetCharacter: (characterId: string) => void;
  resetAllProgress: () => void;

  // ── Getters ─────────────────────────────────────────────────────

  getCurrentLayer: (characterId: string) => number;
  isCharacterFullyStripped: (characterId: string) => boolean;
  getLayerImagePath: (characterId: string) => string;
}

// ── Default session values (used on reset / initial load) ───────────

const DEFAULT_CHIPS = 1000;

const defaultSession = {
  roundNumber: 0,
  playerChips: DEFAULT_CHIPS,
  opponentChips: DEFAULT_CHIPS,
  gameOver: false,
  gameOverReason: null,
  pendingEvents: [] as GameEvent[],
};

// ── Helpers ─────────────────────────────────────────────────────────

function ensureCharacterState(
  states: Record<string, CharacterGameState>,
  id: string
): CharacterGameState {
  return (
    states[id] ?? {
      currentLayer: 1,
      handsWon: 0,
      handsLost: 0,
    }
  );
}

// ── Store ───────────────────────────────────────────────────────────

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────────────

      selectedCharacterId: null,
      difficulty: 'medium' as Difficulty,
      characterStates: {},
      ...defaultSession,

      // ── Actions ─────────────────────────────────────────────────

      selectCharacter: (id: string) => {
        set({ selectedCharacterId: id });
      },

      setDifficulty: (d: Difficulty) => {
        set({ difficulty: d });
      },

      advanceLayer: (characterId: string) => {
        set((state) => {
          const current = ensureCharacterState(state.characterStates, characterId);
          const nextLayer = Math.min(current.currentLayer + 1, TOTAL_LAYERS);
          return {
            characterStates: {
              ...state.characterStates,
              [characterId]: {
                ...current,
                currentLayer: nextLayer,
              },
            },
          };
        });
      },

      recordHandResult: (characterId: string, won: boolean) => {
        set((state) => {
          const current = ensureCharacterState(state.characterStates, characterId);
          return {
            characterStates: {
              ...state.characterStates,
              [characterId]: {
                ...current,
                handsWon: current.handsWon + (won ? 1 : 0),
                handsLost: current.handsLost + (won ? 0 : 1),
              },
            },
          };
        });
      },

      updateChips: (player: number, opponent: number) => {
        set({ playerChips: player, opponentChips: opponent });
      },

      setRoundNumber: (n: number) => {
        set({ roundNumber: n });
      },

      setGameOver: (reason: string) => {
        set({ gameOver: true, gameOverReason: reason });
      },

      pushEvents: (events: GameEvent[]) => {
        set((state) => ({
          pendingEvents: [...state.pendingEvents, ...events],
        }));
      },

      clearEvents: () => {
        set({ pendingEvents: [] });
      },

      resetGame: () => {
        // Resets session state but keeps clothing progress & difficulty
        set({ ...defaultSession });
      },

      resetCharacter: (characterId: string) => {
        set((state) => {
          const updated = { ...state.characterStates };
          delete updated[characterId];
          return { characterStates: updated };
        });
      },

      resetAllProgress: () => {
        set({
          selectedCharacterId: null,
          difficulty: 'medium' as Difficulty,
          characterStates: {},
          ...defaultSession,
        });
      },

      // ── Getters ─────────────────────────────────────────────────

      getCurrentLayer: (characterId: string) => {
        const state = get();
        return ensureCharacterState(state.characterStates, characterId).currentLayer;
      },

      isCharacterFullyStripped: (characterId: string) => {
        const state = get();
        const cs = ensureCharacterState(state.characterStates, characterId);
        return cs.currentLayer >= TOTAL_LAYERS;
      },

      getLayerImagePath: (characterId: string) => {
        const state = get();
        const layer = ensureCharacterState(state.characterStates, characterId).currentLayer;
        return `/characters/${characterId}/layer${layer}.jpg`;
      },
    }),
    {
      name: 'strip-poker-game-state',
      // Only persist clothing progress and preferences, NOT session state
      partialize: (state) => ({
        selectedCharacterId: state.selectedCharacterId,
        difficulty: state.difficulty,
        characterStates: state.characterStates,
      }),
    }
  )
);
