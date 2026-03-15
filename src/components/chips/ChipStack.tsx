'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { chipVariants, stagger, EASING } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';
import Chip from './Chip';
import { valueToChipBreakdown } from './chipUtils';
import type { ChipDenomination } from './chipUtils';

export interface ChipStackProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  showValue?: boolean;
  className?: string;
}

const STACK_OFFSET = 3; // px vertical offset per chip
const stackVariants = chipVariants.stack as unknown as Variants;

export default function ChipStack({
  value,
  size = 'md',
  maxVisible = 8,
  showValue = true,
  className,
}: ChipStackProps) {
  const chips = useMemo(() => {
    const breakdown = valueToChipBreakdown(value);
    // Flatten into individual chips for stacking
    const flat: ChipDenomination[] = [];
    for (const { denomination, count } of breakdown) {
      for (let i = 0; i < count; i++) {
        flat.push(denomination);
      }
    }
    return flat.slice(0, maxVisible);
  }, [value, maxVisible]);

  return (
    <motion.div
      className={className}
      variants={stackVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      {/* Chip pile */}
      <motion.div
        variants={{ animate: stagger.chips }}
        initial="initial"
        animate="animate"
        style={{ position: 'relative', height: chips.length * STACK_OFFSET + (size === 'sm' ? 28 : size === 'md' ? 36 : 48) }}
      >
        {chips.map((denom, i) => (
          <motion.div
            key={`${denom.value}-${i}`}
            variants={stackVariants}
            style={{
              position: 'absolute',
              bottom: i * STACK_OFFSET,
              left: 0,
            }}
          >
            <Chip denomination={denom} size={size} />
          </motion.div>
        ))}
      </motion.div>

      {/* Value label */}
      {showValue && value > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASING.chipBounce as unknown as [number, number, number, number] }}
            style={{
              fontSize: size === 'sm' ? 10 : size === 'md' ? 12 : 14,
              fontWeight: 600,
              fontFamily: TOKENS.typography.fontBody,
              color: TOKENS.colors.gold,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              userSelect: 'none',
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
