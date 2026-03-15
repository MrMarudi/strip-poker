'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiVariants } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';
import Chip from './Chip';
import { valueToChipBreakdown } from './chipUtils';

export interface PotDisplayProps {
  amount: number;
  className?: string;
  compact?: boolean;
}

export default function PotDisplay({ amount, className, compact = false }: PotDisplayProps) {
  const chips = useMemo(() => {
    const breakdown = valueToChipBreakdown(amount);
    // Show up to 5 representative chips in a scattered pile
    const flat = breakdown.flatMap(({ denomination, count }) =>
      Array.from({ length: Math.min(count, 2) }, () => denomination)
    );
    return flat.slice(0, compact ? 3 : 5);
  }, [amount, compact]);

  if (compact) {
    return (
      <div
        id="pot-area"
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: '12px',
          border: '1px solid rgba(212,175,55,0.25)',
          background: 'rgba(7,6,10,0.6)',
        }}
      >
        {amount > 0 && (
          <div style={{ position: 'relative', height: 24, width: 36, flexShrink: 0 }}>
            {chips.map((denom, i) => (
              <div
                key={`${denom.value}-${i}`}
                style={{
                  position: 'absolute',
                  left: 4 + (i % 3) * 6,
                  bottom: Math.floor(i / 3) * 2,
                  transform: `rotate(${(i * 15) - 15}deg) scale(0.8)`,
                }}
              >
                <Chip denomination={denom} size="sm" />
              </div>
            ))}
          </div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={amount}
            variants={uiVariants.potCounter}
            initial="initial"
            animate="animate"
            style={{
              fontFamily: TOKENS.typography.fontDisplay,
              fontWeight: 700,
              fontSize: 14,
              background: TOKENS.gradients.goldText,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              userSelect: 'none',
              lineHeight: 1,
            }}
          >
            {amount > 0 ? amount : '—'}
          </motion.span>
        </AnimatePresence>
        <span
          style={{
            fontSize: 9,
            fontFamily: TOKENS.typography.fontBody,
            color: 'rgba(212,175,55,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            userSelect: 'none',
          }}
        >
          Pot
        </span>
      </div>
    );
  }

  return (
    <div
      id="pot-area"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        borderRadius: TOKENS.radius.panel,
        border: '1px solid rgba(212,175,55,0.3)',
        boxShadow: TOKENS.shadows.goldGlow,
        background: 'rgba(7,6,10,0.6)',
        minWidth: 80,
      }}
    >
      {/* Chip pile */}
      {amount > 0 && (
        <div style={{ position: 'relative', height: 36, width: 60, display: 'flex', justifyContent: 'center' }}>
          {chips.map((denom, i) => (
            <div
              key={`${denom.value}-${i}`}
              style={{
                position: 'absolute',
                left: 10 + (i % 3) * 8 - (i > 2 ? 4 : 0),
                bottom: Math.floor(i / 3) * 3,
                transform: `rotate(${(i * 15) - 15}deg)`,
              }}
            >
              <Chip denomination={denom} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Pot amount */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={amount}
          variants={uiVariants.potCounter}
          initial="initial"
          animate="animate"
          style={{
            fontFamily: TOKENS.typography.fontDisplay,
            fontWeight: 700,
            fontSize: 18,
            background: TOKENS.gradients.goldText,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            userSelect: 'none',
            lineHeight: 1.2,
          }}
        >
          {amount > 0 ? amount : '—'}
        </motion.div>
      </AnimatePresence>

      <span
        style={{
          fontSize: 10,
          fontFamily: TOKENS.typography.fontBody,
          color: 'rgba(212,175,55,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          userSelect: 'none',
        }}
      >
        Pot
      </span>
    </div>
  );
}
