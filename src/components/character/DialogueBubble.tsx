'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characterVariants, TIMING } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';

export interface DialogueBubbleProps {
  text: string | null;
  characterName?: string;
  onDismiss?: () => void;
}

export default function DialogueBubble({
  text,
  characterName,
  onDismiss,
}: DialogueBubbleProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (text != null && onDismiss) {
      timerRef.current = setTimeout(() => {
        onDismiss();
        timerRef.current = null;
      }, TIMING.dialogue.display * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, onDismiss]);

  return (
    <AnimatePresence>
      {text != null && (
        <motion.div
          key={text}
          variants={characterVariants.dialogue}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onDismiss}
          style={{
            position: 'relative',
            maxWidth: '200px',
            padding: '6px 10px',
            background: TOKENS.colors.cream,
            border: `2px solid ${TOKENS.colors.gold}`,
            borderRadius: '12px',
            boxShadow: TOKENS.shadows.goldGlow,
            cursor: onDismiss ? 'pointer' : 'default',
          }}
        >
          {/* Speech bubble tail pointing left toward character */}
          <div
            style={{
              position: 'absolute',
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: `10px solid ${TOKENS.colors.gold}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-7px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: `8px solid ${TOKENS.colors.cream}`,
            }}
          />

          {/* Character name */}
          {characterName && (
            <div
              style={{
                fontFamily: TOKENS.typography.fontDisplay,
                fontSize: '12px',
                fontWeight: 700,
                color: TOKENS.colors.gold,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {characterName}
            </div>
          )}

          {/* Dialogue text */}
          <div
            style={{
              fontFamily: TOKENS.typography.fontBody,
              fontSize: '11px',
              lineHeight: 1.3,
              color: TOKENS.colors.darkAccent,
            }}
          >
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
