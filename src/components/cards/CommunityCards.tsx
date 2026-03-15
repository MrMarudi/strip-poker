'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './AnimatedCard';
import { cardVariants, stagger, TIMING } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';
import type { Card } from '@/game/types';

interface CommunityCardsProps {
  cards: Card[];
  revealedCount: number;
  highlightIndices?: number[];
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  className?: string;
}

const TOTAL_SLOTS = 5;

/** Stagger delay per card based on poker streets: flop (0-2), turn (3), river (4) */
function getCardDelay(index: number, revealedCount: number): number {
  // Flop cards stagger together
  if (index < 3) {
    return stagger.flopReveal.delayChildren + index * stagger.flopReveal.staggerChildren;
  }
  // Turn and river appear individually
  return 0.1;
}

const emptySlotStyle = (width: number, height: number): React.CSSProperties => ({
  width,
  height,
  borderRadius: TOKENS.radius.card,
  border: `1.5px dashed rgba(212, 175, 55, 0.35)`,
  backgroundColor: 'rgba(26, 71, 42, 0.5)',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
  display: 'inline-block',
  flexShrink: 0,
});

const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  revealedCount,
  highlightIndices = [],
  cardWidth = 90,
  cardHeight = 126,
  gap = 8,
  className,
}) => {
  const visibleCards = cards.slice(0, revealedCount);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
      }}
    >
      <AnimatePresence mode="popLayout">
        {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
          const card = visibleCards[index];
          const isHighlighted = highlightIndices.includes(index);

          if (card) {
            return (
              <motion.div
                key={`community-${index}-${card.suit}-${card.rank}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  ...cardVariants.cleanup.exit,
                }}
              >
                <AnimatedCard
                  card={card}
                  faceUp
                  state={isHighlighted ? 'highlighted' : 'faceUp'}
                  highlighted={isHighlighted}
                  delay={getCardDelay(index, revealedCount)}
                  width={cardWidth}
                  height={cardHeight}
                />
              </motion.div>
            );
          }

          // Empty slot placeholder
          return (
            <motion.div
              key={`empty-slot-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              style={emptySlotStyle(cardWidth, cardHeight)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CommunityCards;
