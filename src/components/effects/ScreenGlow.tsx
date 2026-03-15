'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { celebrationIntensity } from '@/animations/specs';

interface ScreenGlowProps {
  active: boolean;
  intensity?: 'small' | 'medium' | 'large' | 'jackpot';
}

export default function ScreenGlow({ active, intensity = 'small' }: ScreenGlowProps) {
  const config = celebrationIntensity[intensity];
  const glowOpacity = config.glow;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="screen-glow"
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(212,175,55,${glowOpacity}) 0%, rgba(240,208,96,${glowOpacity * 0.5}) 40%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.15, 0.08, 0.12, 0],
            transition: { duration: 1.5, ease: 'easeInOut' as const },
          }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        />
      )}
    </AnimatePresence>
  );
}
