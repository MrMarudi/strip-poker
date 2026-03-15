'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GirlWinRevealProps {
  active: boolean;
  characterId: string;
  currentLayer: number;
  displayName: string;
  handRank?: string;
  onDismiss?: () => void;
}

export default function GirlWinReveal({
  active,
  characterId,
  currentLayer,
  displayName,
  handRank,
  onDismiss,
}: GirlWinRevealProps) {
  const imageSrc = `/characters/${characterId}/layer${currentLayer}.jpg`;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 max-w-[85vw]"
          >
            {/* Girl image — BIG */}
            <motion.div
              initial={{ scale: 0.9, rotateZ: -2 }}
              animate={{ scale: 1, rotateZ: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.4)]"
            >
              {/* Gold shimmer overlay */}
              <motion.div
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0) 100%)',
                    'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0) 50%, rgba(212,175,55,0.15) 100%)',
                    'linear-gradient(135deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0) 100%)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 z-10 pointer-events-none"
              />

              <Image
                src={imageSrc}
                alt={`${displayName} reveal`}
                width={340}
                height={450}
                className="w-[260px] h-[340px] sm:w-[340px] sm:h-[450px] object-cover"
                priority
              />
            </motion.div>

            {/* Name + hand rank */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="font-playfair text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
                {displayName}
              </p>
              {handRank && (
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                  className="text-white/80 text-sm sm:text-base mt-1"
                >
                  lost with {handRank}
                </motion.p>
              )}
            </motion.div>

            {/* Sparkle particles around the image */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 160,
                  y: Math.sin((i / 8) * Math.PI * 2) * 200,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.4 + i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute w-2 h-2 rounded-full bg-[#d4af37]"
                style={{ filter: 'blur(1px)' }}
              />
            ))}

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="text-white/40 text-xs mt-2"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
