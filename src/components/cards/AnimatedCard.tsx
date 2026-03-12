'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CardSVG from './CardSVG';
import CardBack from './CardBack';

interface AnimatedCardProps {
  card?: {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  };
  faceUp: boolean;
  cardBackStyle?: 'classic' | 'elegant' | 'modern';
  width?: number;
  height?: number;
  delay?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card,
  faceUp,
  cardBackStyle = 'classic',
  width = 100,
  height = 140,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        perspective: 800,
        display: 'inline-block',
      }}
      /* Deal animation: slide in from off-screen right with scale */
      initial={{
        x: 300,
        y: -200,
        scale: 0.5,
        opacity: 0,
      }}
      animate={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: faceUp ? 0 : 180,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: delay * 0.3,
        }}
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
  );
};

export default AnimatedCard;
