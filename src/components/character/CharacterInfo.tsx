'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { characterVariants } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';
import { ChipStack } from '@/components/chips';

export interface CharacterInfoProps {
  characterId: string;
  displayName: string;
  chips: number;
  handsWon: number;
  isThinking?: boolean;
  isDealer?: boolean;
  compact?: boolean;
}

export default function CharacterInfo({
  displayName,
  chips,
  handsWon,
  isThinking = false,
  isDealer = false,
  compact = false,
}: CharacterInfoProps) {
  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* Name + dealer + chips all in one row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: TOKENS.typography.fontDisplay,
              fontSize: '13px',
              fontWeight: 700,
              background: TOKENS.gradients.goldText,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayName}
          </span>
          {isDealer && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: TOKENS.colors.gold,
                color: TOKENS.colors.void,
                fontFamily: TOKENS.typography.fontBody,
                fontSize: '9px',
                fontWeight: 800,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              D
            </span>
          )}
          {isThinking && (
            <motion.span
              variants={characterVariants.thinking as unknown as Variants}
              animate="animate"
              style={{
                fontFamily: TOKENS.typography.fontBody,
                fontSize: '13px',
                color: TOKENS.colors.goldLight,
              }}
            >
              ...
            </motion.span>
          )}
          <span
            style={{
              fontFamily: TOKENS.typography.fontBody,
              fontSize: '12px',
              fontWeight: 600,
              color: TOKENS.colors.gold,
            }}
          >
            ${chips}
          </span>
        </div>
        <div
          style={{
            fontFamily: TOKENS.typography.fontBody,
            fontSize: '10px',
            color: TOKENS.colors.cream,
            opacity: 0.5,
          }}
        >
          Won: {handsWon}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: '120px',
      }}
    >
      {/* Name plate row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            fontFamily: TOKENS.typography.fontDisplay,
            fontSize: '16px',
            fontWeight: 700,
            background: TOKENS.gradients.goldText,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {displayName}
        </span>

        {/* Dealer button */}
        {isDealer && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: TOKENS.colors.gold,
              color: TOKENS.colors.void,
              fontFamily: TOKENS.typography.fontBody,
              fontSize: '11px',
              fontWeight: 800,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            D
          </span>
        )}

        {/* Thinking dots */}
        {isThinking && (
          <motion.span
            variants={characterVariants.thinking as unknown as Variants}
            animate="animate"
            style={{
              fontFamily: TOKENS.typography.fontBody,
              fontSize: '16px',
              color: TOKENS.colors.goldLight,
              marginLeft: '2px',
            }}
          >
            ...
          </motion.span>
        )}
      </div>

      {/* Chip count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ChipStack value={chips} size="sm" showValue maxVisible={3} />
      </div>

      {/* Hands won */}
      <div
        style={{
          fontFamily: TOKENS.typography.fontBody,
          fontSize: '12px',
          color: TOKENS.colors.cream,
          opacity: 0.7,
        }}
      >
        Hands won: {handsWon}
      </div>
    </div>
  );
}
