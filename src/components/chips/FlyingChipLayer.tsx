'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chipVariants, TIMING, EASING } from '@/animations/specs';
import type { FlyingChip } from '@/animations/chipAnimations';
import { DENOMINATIONS } from './chipUtils';
import Chip from './Chip';

export interface FlyingChipLayerProps {
  chips: FlyingChip[];
}

/**
 * Fixed overlay layer that renders flying chip animations.
 * Each FlyingChip animates along an arc trajectory from source to destination
 * using chipVariants.toss from the animation specs.
 */
export default function FlyingChipLayer({ chips }: FlyingChipLayerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <AnimatePresence>
        {chips.map((chip) => {
          // Find the closest matching denomination for the chip visual
          const denom =
            DENOMINATIONS.find((d) => d.value === chip.denomination) ||
            DENOMINATIONS.find((d) => d.value <= chip.denomination) ||
            DENOMINATIONS[DENOMINATIONS.length - 1];

          // Compute the arc midpoint — chips rise before falling
          const midX = (chip.fromX + chip.toX) / 2;
          const midY = Math.min(chip.fromY, chip.toY) - 80;

          return (
            <motion.div
              key={chip.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                // Center the chip on the coordinate
                width: 28,
                height: 28,
                marginLeft: -14,
                marginTop: -14,
              }}
              initial={{
                x: chip.fromX,
                y: chip.fromY,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: [chip.fromX, midX, chip.toX],
                y: [chip.fromY, midY, chip.toY],
                scale: [1, 1.1, 0.95, 1],
                rotate: [0, 15, -5, 0],
                opacity: 1,
                transition: {
                  duration: TIMING.chip.duration,
                  ease: [...EASING.chipBounce],
                  delay: chip.delay,
                },
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.15 },
              }}
            >
              <Chip denomination={denom} size="sm" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
