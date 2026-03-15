'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Product catalog ─────────────────────────────────────────────────

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;        // USD cents
  priceDisplay: string; // "$2.99"
  type: 'character' | 'bundle' | 'chips';
  characterId?: string;
  chipAmount?: number;
}

export const PRODUCTS: ShopProduct[] = [
  { id: 'unlock-sakura', name: 'Unlock Sakura', description: 'The shy beauty from Tokyo', price: 299, priceDisplay: '$2.99', type: 'character', characterId: 'sakura' },
  { id: 'unlock-valentina', name: 'Unlock Valentina', description: 'The bold Latina firecracker', price: 299, priceDisplay: '$2.99', type: 'character', characterId: 'valentina' },
  { id: 'unlock-zara', name: 'Unlock Zara', description: 'The fierce queen of the table', price: 299, priceDisplay: '$2.99', type: 'character', characterId: 'zara' },
  { id: 'bundle-all', name: 'All Characters Bundle', description: 'Unlock all 5 characters — best value!', price: 499, priceDisplay: '$4.99', type: 'bundle' },
  { id: 'chips-1000', name: '1,000 Chips', description: 'Keep the game going', price: 99, priceDisplay: '$0.99', type: 'chips', chipAmount: 1000 },
  { id: 'chips-5000', name: '5,000 Chips', description: 'Big stack energy', price: 299, priceDisplay: '$2.99', type: 'chips', chipAmount: 5000 },
  { id: 'chips-20000', name: '20,000 Chips', description: 'High roller pack', price: 699, priceDisplay: '$6.99', type: 'chips', chipAmount: 20000 },
];

// All premium character IDs (for bundle unlock)
const ALL_CHARACTER_IDS = ['luna', 'emma', 'sakura', 'valentina', 'zara'];
const DAILY_BONUS_CHIPS = 500;
const DAILY_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Store shape ─────────────────────────────────────────────────────

interface ShopState {
  unlockedCharacters: string[];
  lastDailyBonus: string | null; // ISO date string

  // Actions
  unlockCharacter: (id: string) => void;
  unlockAll: () => void;
  isCharacterUnlocked: (id: string) => boolean;
  claimDailyBonus: () => boolean;
  canClaimDailyBonus: () => boolean;
  getMillisUntilNextBonus: () => number;

  // Analytics
  trackPurchaseIntent: (productId: string) => void;
}

// ── Store ───────────────────────────────────────────────────────────

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      unlockedCharacters: ['luna', 'emma'],
      lastDailyBonus: null,

      unlockCharacter: (id: string) => {
        set((state) => {
          if (state.unlockedCharacters.includes(id)) return state;
          return {
            unlockedCharacters: [...state.unlockedCharacters, id],
          };
        });
      },

      unlockAll: () => {
        set({ unlockedCharacters: [...ALL_CHARACTER_IDS] });
      },

      isCharacterUnlocked: (id: string) => {
        return get().unlockedCharacters.includes(id);
      },

      claimDailyBonus: () => {
        const state = get();
        const now = Date.now();
        const last = state.lastDailyBonus ? new Date(state.lastDailyBonus).getTime() : 0;

        if (now - last < DAILY_BONUS_COOLDOWN_MS) {
          return false;
        }

        set({ lastDailyBonus: new Date(now).toISOString() });
        // The caller (shop page) is responsible for adding chips to gameStore
        console.log(`[Shop] Daily bonus claimed: +${DAILY_BONUS_CHIPS} chips`);
        return true;
      },

      canClaimDailyBonus: () => {
        const state = get();
        if (!state.lastDailyBonus) return true;
        const last = new Date(state.lastDailyBonus).getTime();
        return Date.now() - last >= DAILY_BONUS_COOLDOWN_MS;
      },

      getMillisUntilNextBonus: () => {
        const state = get();
        if (!state.lastDailyBonus) return 0;
        const last = new Date(state.lastDailyBonus).getTime();
        const remaining = DAILY_BONUS_COOLDOWN_MS - (Date.now() - last);
        return Math.max(0, remaining);
      },

      trackPurchaseIntent: (productId: string) => {
        console.log(`[Shop Analytics] Purchase intent: ${productId} at ${new Date().toISOString()}`);
      },
    }),
    {
      name: 'strip-poker-shop',
    }
  )
);

export { DAILY_BONUS_CHIPS };
