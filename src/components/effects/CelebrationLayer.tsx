'use client';

import { useEffect, useState } from 'react';
import { celebrationIntensity } from '@/animations/specs';
import ScreenGlow from './ScreenGlow';
import HandRankReveal from './HandRankReveal';
import ChipRainEffect from './ChipRainEffect';
import TableSpotlight from './TableSpotlight';

type Intensity = 'none' | 'small' | 'medium' | 'large' | 'jackpot';

interface CelebrationLayerProps {
  intensity: Intensity;
  handRank?: string;
}

export default function CelebrationLayer({ intensity, handRank }: CelebrationLayerProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (intensity === 'none') {
      setActive(false);
      return;
    }

    setActive(true);
    const config = celebrationIntensity[intensity];
    const timer = setTimeout(() => setActive(false), config.duration * 1000);
    return () => clearTimeout(timer);
  }, [intensity]);

  if (intensity === 'none' && !active) return null;

  const glowIntensity = intensity === 'none' ? 'small' : intensity;
  const showGlow = active && intensity !== 'none';
  const showRank = active && (intensity === 'medium' || intensity === 'large' || intensity === 'jackpot');
  const showChips = active && (intensity === 'large' || intensity === 'jackpot');
  const showSpotlight = active && intensity === 'jackpot';

  return (
    <>
      <ScreenGlow active={showGlow} intensity={glowIntensity} />
      <HandRankReveal handRank={showRank && handRank ? handRank : null} />
      <ChipRainEffect active={showChips} chipCount={intensity === 'jackpot' ? 30 : 15} />
      <TableSpotlight active={showSpotlight} />
    </>
  );
}
