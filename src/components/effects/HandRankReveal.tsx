'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { celebrationVariants } from '@/animations/specs';

interface HandRankRevealProps {
  handRank: string | null;
  onDismiss?: () => void;
}

export default function HandRankReveal({ handRank, onDismiss }: HandRankRevealProps) {
  useEffect(() => {
    if (!handRank) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [handRank, onDismiss]);

  return (
    <AnimatePresence>
      {handRank && (
        <motion.div
          key="hand-rank-reveal"
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          variants={celebrationVariants.handRankReveal}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <span
            className="text-5xl md:text-7xl font-bold tracking-wide"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              background: 'linear-gradient(135deg, #d4af37, #f0d060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(212,175,55,0.6), 0 0 80px rgba(212,175,55,0.3)',
              filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))',
            }}
          >
            {handRank}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
