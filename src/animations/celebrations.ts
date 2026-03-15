'use client';

import { useState, useCallback } from 'react';
import { celebrationIntensity } from './specs';

export type CelebrationIntensity = 'none' | 'small' | 'medium' | 'large' | 'jackpot';

export function useCelebrations() {
  const [intensity, setIntensity] = useState<CelebrationIntensity>('none');
  const [handRank, setHandRank] = useState<string | null>(null);

  const celebrate = useCallback(async (level: CelebrationIntensity, rank?: string) => {
    setIntensity(level);
    if (rank) setHandRank(rank);

    const config = celebrationIntensity[level === 'none' ? 'small' : level];
    await new Promise((r) => setTimeout(r, config.duration * 1000));

    setIntensity('none');
    setHandRank(null);
  }, []);

  const cancel = useCallback(() => {
    setIntensity('none');
    setHandRank(null);
  }, []);

  return { intensity, handRank, celebrate, cancel };
}
