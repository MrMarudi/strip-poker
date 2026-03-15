'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import CardSVG from './CardSVG';
import CardBack from './CardBack';
import { cardVariants, TIMING, EASING } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';
import type { Card } from '@/game/types';

export type CardState = 'faceDown' | 'faceUp' | 'dealing' | 'highlighted';

interface AnimatedCardProps {
  card?: Card;
  faceUp?: boolean;
  state?: CardState;
  delay?: number;
  cardBackStyle?: 'classic' | 'elegant' | 'modern';
  width?: number;
  height?: number;
  highlighted?: boolean;
  className?: string;
}

const dealVariants: Variants = {
  initial: cardVariants.deal.initial,
  animate: (delay: number) => ({
    ...cardVariants.deal.animate,
    transition: {
      ...cardVariants.deal.animate.transition,
      delay,
    },
  }),
  exit: cardVariants.deal.exit,
};

const highlightVariants: Variants = {
  initial: cardVariants.winHighlight.initial,
  animate: {
    ...cardVariants.winHighlight.animate,
    transition: {
      ...(cardVariants.winHighlight.animate as Record<string, unknown>).transition as object,
      ease: 'easeInOut' as const,
    },
  },
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card,
  faceUp = false,
  state,
  cardBackStyle = 'classic',
  width = 100,
  height = 140,
  delay = 0,
  highlighted = false,
  className,
}) => {
  const resolvedState = state ?? (faceUp ? 'faceUp' : 'faceDown');
  const isFaceUp = resolvedState === 'faceUp' || resolvedState === 'highlighted';
  const isHighlighted = resolvedState === 'highlighted' || highlighted;
  const isDealing = resolvedState === 'dealing';

  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        perspective: 800,
        display: 'inline-block',
        borderRadius: TOKENS.radius.card,
      }}
      variants={dealVariants}
      custom={delay}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Golden glow wrapper for highlighted (winning) cards */}
      <motion.div
        variants={isHighlighted ? highlightVariants : undefined}
        initial={isHighlighted ? 'initial' : undefined}
        animate={isHighlighted ? 'animate' : undefined}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: TOKENS.radius.card,
          boxShadow: isHighlighted ? TOKENS.shadows.goldGlow : TOKENS.shadows.card,
        }}
      >
        {/* 3D flip container */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
          variants={cardVariants.flip}
          animate={isFaceUp ? 'faceUp' : 'faceDown'}
        >
          {/* Front face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {card ? (
              <CardSVG
                suit={card.suit}
                rank={card.rank}
                width={width}
                height={height}
              />
            ) : (
              <CardBack
                style={cardBackStyle}
                width={width}
                height={height}
              />
            )}
          </div>

          {/* Back face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardBack
              style={cardBackStyle}
              width={width}
              height={height}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedCard;
