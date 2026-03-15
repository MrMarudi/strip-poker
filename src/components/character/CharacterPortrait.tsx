'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { characterVariants } from '@/animations/specs';
import { TOKENS } from '@/design/tokens';

export interface CharacterPortraitProps {
  characterId: string;
  currentLayer: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showHero?: boolean;
}

const SIZE_MAP = {
  xs: { width: 80, height: 106 },
  sm: { width: 120, height: 160 },
  md: { width: 200, height: 280 },
  lg: { width: 300, height: 420 },
} as const;

function getInitials(id: string): string {
  return id.slice(0, 2).toUpperCase();
}

export default function CharacterPortrait({
  characterId,
  currentLayer,
  size = 'md',
  showHero = false,
}: CharacterPortraitProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dimensions = SIZE_MAP[size];

  const imageSrc = showHero
    ? `/characters/${characterId}/hero.jpg`
    : `/characters/${characterId}/layer${currentLayer}.jpg`;

  // Reset error/loading state when image source changes
  const imageKey = imageSrc;

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: '12px',
        border: `2px solid ${TOKENS.colors.gold}`,
        boxShadow: TOKENS.shadows.goldRim,
        overflow: 'hidden',
        background: TOKENS.colors.darkAccent,
        flexShrink: 0,
      }}
    >
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${TOKENS.colors.darkAccent}, ${TOKENS.colors.velvet})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '60%',
              height: '60%',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${TOKENS.colors.velvet}, ${TOKENS.colors.darkAccent})`,
            }}
          />
        </div>
      )}

      {/* Fallback with initials */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${TOKENS.colors.velvet}, ${TOKENS.colors.darkAccent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: TOKENS.typography.fontDisplay,
              fontSize: size === 'lg' ? '48px' : size === 'md' ? '36px' : '24px',
              color: TOKENS.colors.gold,
              fontWeight: 700,
            }}
          >
            {getInitials(characterId)}
          </span>
        </div>
      )}

      {/* Animated portrait image */}
      <AnimatePresence mode="wait">
        {!hasError && (
          <motion.div
            key={imageKey}
            variants={characterVariants.layerTransition as unknown as Variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
            }}
          >
            <Image
              src={imageSrc}
              alt={`${characterId} portrait`}
              width={dimensions.width}
              height={dimensions.height}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
              onError={handleError}
              onLoad={handleLoad}
              priority={showHero}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
