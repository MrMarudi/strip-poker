'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { characterVariants } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';

export interface ReactionIndicatorProps {
  reaction: 'win' | 'lose' | 'bluff' | 'allIn' | null;
}

const REACTION_EMOJI: Record<string, string> = {
  win: '\u2728',     // sparkle
  lose: '\uD83D\uDCA7', // sweat droplet
  bluff: '\uD83D\uDE0F', // smirk
  allIn: '\uD83D\uDD25', // fire
};

const REACTION_LABELS: Record<string, string> = {
  win: 'Win!',
  lose: 'Ouch...',
  bluff: 'Bluff!',
  allIn: 'ALL IN!',
};

export default function ReactionIndicator({ reaction }: ReactionIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reaction) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [reaction]);

  return (
    <AnimatePresence>
      {visible && reaction && (
        <motion.div
          key={reaction}
          animate={characterVariants.reaction[reaction] as unknown as TargetAndTransition}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '12px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3 },
          }}
        >
          <span style={{ fontSize: '40px', lineHeight: 1 }}>
            {REACTION_EMOJI[reaction]}
          </span>
          <span
            style={{
              marginTop: '4px',
              fontFamily: TOKENS.typography.fontDisplay,
              fontSize: '14px',
              fontWeight: 700,
              color: TOKENS.colors.gold,
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {REACTION_LABELS[reaction]}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
