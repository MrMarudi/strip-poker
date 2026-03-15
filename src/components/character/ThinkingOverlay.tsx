'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOKENS } from '@/design/tokens';
import { TIMING } from '@/animations/specs';

export interface ThinkingOverlayProps {
  isThinking: boolean;
}

const DOT_COUNT = 3;

export default function ThinkingOverlay({ isThinking }: ThinkingOverlayProps) {
  return (
    <AnimatePresence>
      {isThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(7,6,10,0.55)',
            borderRadius: '12px',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          {/* Animated dots */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: TIMING.character.thinking,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: TOKENS.colors.gold,
                  boxShadow: TOKENS.shadows.goldGlow,
                }}
              />
            ))}
          </div>

          {/* "Thinking..." text */}
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: TOKENS.typography.fontBody,
              fontSize: '12px',
              color: TOKENS.colors.cream,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Thinking...
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
