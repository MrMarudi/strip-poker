'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './AnimatedCard';
import { stagger, TIMING } from '@/animations/specs';
import type { Card } from '@/game/types';

interface PlayerHandProps {
  cards: Card[];
  faceUp?: boolean;
  highlighted?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

/**
 * Renders a player's 2 hole cards with a slight overlap and fan angle.
 * Supports faceDown (opponents) and faceUp (player/showdown) states.
 * Cards animate in with a staggered deal.
 */
const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  faceUp = false,
  highlighted = false,
  cardWidth = 80,
  cardHeight = 112,
  className,
}) => {
  // Fan layout: slight rotation and horizontal offset for each card
  const fanConfigs = [
    { rotate: -6, translateX: 8, zIndex: 1 },
    { rotate: 6, translateX: -8, zIndex: 2 },
  ];

  return (
    <motion.div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      initial="initial"
      animate="animate"
      transition={stagger.cards}
    >
      <AnimatePresence>
        {cards.slice(0, 2).map((card, index) => {
          const fan = fanConfigs[index];
          const dealDelay =
            stagger.cards.delayChildren + index * stagger.cards.staggerChildren;

          return (
            <motion.div
              key={`hole-${index}-${card.suit}-${card.rank}`}
              style={{
                marginLeft: index === 0 ? 0 : -(cardWidth * 0.3),
                zIndex: fan.zIndex,
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: fan.rotate, x: fan.translateX }}
              transition={{
                delay: dealDelay + 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              exit={{
                y: -200,
                opacity: 0,
                rotate: 15,
                transition: { duration: 0.3 },
              }}
            >
              <AnimatedCard
                card={card}
                faceUp={faceUp}
                state={
                  highlighted
                    ? 'highlighted'
                    : faceUp
                      ? 'faceUp'
                      : 'faceDown'
                }
                highlighted={highlighted}
                delay={dealDelay}
                width={cardWidth}
                height={cardHeight}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerHand;
