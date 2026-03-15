'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBack from './CardBack';
import { TOKENS } from '@/design/tokens';
import { EASING } from '@/animations/specs';

interface CardDeckProps {
  cardsRemaining?: number;
  cardBackStyle?: 'classic' | 'elegant' | 'modern';
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

const MAX_VISIBLE_LAYERS = 4;
const LAYER_OFFSET_X = 1.5;
const LAYER_OFFSET_Y = 1.5;

/**
 * Visual representation of the card deck as a stacked pile.
 * Shows up to 4 overlapping card backs for a 3D stack effect.
 * Cards animate out when dealing (AnimatePresence).
 */
const CardDeck: React.FC<CardDeckProps> = ({
  cardsRemaining = 52,
  cardBackStyle = 'classic',
  cardWidth = 80,
  cardHeight = 112,
  className,
}) => {
  // Show fewer layers as the deck shrinks
  const visibleLayers = Math.min(
    MAX_VISIBLE_LAYERS,
    Math.max(1, Math.ceil(cardsRemaining / 13)),
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: cardWidth + LAYER_OFFSET_X * MAX_VISIBLE_LAYERS,
        height: cardHeight + LAYER_OFFSET_Y * MAX_VISIBLE_LAYERS,
      }}
    >
      <AnimatePresence>
        {Array.from({ length: visibleLayers }).map((_, index) => {
          // Bottom layers first (index 0 = deepest)
          const depth = visibleLayers - 1 - index;

          return (
            <motion.div
              key={`deck-layer-${index}`}
              style={{
                position: 'absolute',
                left: depth * LAYER_OFFSET_X,
                top: depth * LAYER_OFFSET_Y,
                zIndex: index,
                boxShadow:
                  index === visibleLayers - 1
                    ? TOKENS.shadows.card
                    : '0 1px 3px rgba(0,0,0,0.3)',
                borderRadius: TOKENS.radius.card,
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: {
                  delay: index * 0.04,
                  duration: 0.3,
                  ease: [...EASING.cardSmooth] as [number, number, number, number],
                },
              }}
              exit={{
                x: -120,
                y: -80,
                rotate: -20,
                opacity: 0,
                scale: 0.7,
                transition: { duration: 0.4, ease: [...EASING.cardSmooth] as [number, number, number, number] },
              }}
            >
              <CardBack
                style={cardBackStyle}
                width={cardWidth}
                height={cardHeight}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Remaining card count badge */}
      {cardsRemaining > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: -8,
            right: -8,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: TOKENS.gradients.goldShimmer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: TOKENS.colors.void,
            boxShadow: TOKENS.shadows.goldRim,
            zIndex: MAX_VISIBLE_LAYERS + 1,
          }}
          key={cardsRemaining}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {cardsRemaining}
        </motion.div>
      )}
    </div>
  );
};

export default CardDeck;
