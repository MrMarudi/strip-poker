'use client';

import { useState, useCallback, useRef } from 'react';

/** Represents a flying chip animation */
export interface FlyingChip {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  denomination: number;
  color: string;
  delay: number;
}

/** Sound effect hook points (callbacks for when sound system is added) */
export interface ChipSoundHooks {
  onChipToss?: () => void;
  onChipLand?: () => void;
  onChipCollect?: () => void;
  onBlindPost?: () => void;
}

export function useChipAnimations(soundHooks?: ChipSoundHooks) {
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const cancelRef = useRef(false);

  /** Toss chips from source to pot */
  const tossChipsToPot = useCallback(async (
    amount: number,
    sourceElement: string,
    potElement?: string,
  ) => {
    setIsAnimating(true);
    cancelRef.current = false;

    const source = document.querySelector(sourceElement);
    const pot = document.querySelector(potElement || '#pot-area');
    if (!source || !pot) { setIsAnimating(false); return; }

    const sourceRect = source.getBoundingClientRect();
    const potRect = pot.getBoundingClientRect();

    // Create 1-5 flying chips based on amount
    const chipCount = Math.min(5, Math.max(1, Math.ceil(amount / 200)));
    const chips: FlyingChip[] = Array.from({ length: chipCount }, (_, i) => ({
      id: `toss-${Date.now()}-${i}`,
      fromX: sourceRect.left + sourceRect.width / 2,
      fromY: sourceRect.top + sourceRect.height / 2,
      toX: potRect.left + potRect.width / 2 + (Math.random() - 0.5) * 20,
      toY: potRect.top + potRect.height / 2 + (Math.random() - 0.5) * 20,
      denomination: amount > 100 ? 100 : amount > 25 ? 25 : 5,
      color: amount > 100 ? '#d4af37' : amount > 25 ? '#2d6a4f' : '#c41e3a',
      delay: i * 0.05,
    }));

    soundHooks?.onChipToss?.();
    setFlyingChips(chips);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 400 + chipCount * 50));

    if (!cancelRef.current) {
      soundHooks?.onChipLand?.();
      setFlyingChips([]);
      setIsAnimating(false);
    }
  }, [soundHooks]);

  /** Collect chips from pot to winner */
  const collectPot = useCallback(async (
    targetElement: string,
  ) => {
    setIsAnimating(true);
    cancelRef.current = false;

    const pot = document.querySelector('#pot-area');
    const target = document.querySelector(targetElement);
    if (!pot || !target) { setIsAnimating(false); return; }

    const potRect = pot.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const chips: FlyingChip[] = Array.from({ length: 4 }, (_, i) => ({
      id: `collect-${Date.now()}-${i}`,
      fromX: potRect.left + potRect.width / 2 + (Math.random() - 0.5) * 30,
      fromY: potRect.top + potRect.height / 2,
      toX: targetRect.left + targetRect.width / 2,
      toY: targetRect.top + targetRect.height / 2,
      denomination: 25,
      color: '#d4af37',
      delay: i * 0.08,
    }));

    soundHooks?.onChipCollect?.();
    setFlyingChips(chips);

    await new Promise(resolve => setTimeout(resolve, 600));

    if (!cancelRef.current) {
      setFlyingChips([]);
      setIsAnimating(false);
    }
  }, [soundHooks]);

  /** Post blinds animation */
  const postBlinds = useCallback(async (
    sourceElement: string,
  ) => {
    setIsAnimating(true);

    const source = document.querySelector(sourceElement);
    const pot = document.querySelector('#pot-area');
    if (!source || !pot) { setIsAnimating(false); return; }

    const sourceRect = source.getBoundingClientRect();
    const potRect = pot.getBoundingClientRect();

    const chip: FlyingChip = {
      id: `blind-${Date.now()}`,
      fromX: sourceRect.left + sourceRect.width / 2,
      fromY: sourceRect.top,
      toX: potRect.left + potRect.width / 2,
      toY: potRect.top + potRect.height / 2,
      denomination: 5,
      color: '#c41e3a',
      delay: 0,
    };

    soundHooks?.onBlindPost?.();
    setFlyingChips([chip]);

    await new Promise(resolve => setTimeout(resolve, 350));
    setFlyingChips([]);
    setIsAnimating(false);
  }, [soundHooks]);

  /** Cancel all animations */
  const cancelAnimations = useCallback(() => {
    cancelRef.current = true;
    setFlyingChips([]);
    setIsAnimating(false);
  }, []);

  return {
    flyingChips,
    isAnimating,
    tossChipsToPot,
    collectPot,
    postBlinds,
    cancelAnimations,
  };
}
