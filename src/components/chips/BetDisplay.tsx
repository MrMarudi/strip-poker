'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { chipVariants } from '@/animations/specs';

const stackVariants = chipVariants.stack as unknown as Variants;
import { TOKENS } from '@/design/tokens';
import ChipStack from './ChipStack';

export interface BetDisplayProps {
  amount: number;
  position: 'player' | 'opponent';
  className?: string;
}

export default function BetDisplay({ amount, position, className }: BetDisplayProps) {
  return (
    <AnimatePresence>
      {amount > 0 && (
        <motion.div
          variants={stackVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(position === 'player'
              ? { bottom: 0 }
              : { top: 0 }),
          }}
        >
          <motion.span
            key={amount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: TOKENS.typography.fontBody,
              color: TOKENS.colors.gold,
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Bet: {amount}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
