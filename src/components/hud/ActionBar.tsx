'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiVariants } from '@/animations/specs';
import type { PlayerAction } from '@/game/types';
import RaiseSlider from './RaiseSlider';

interface ActionBarProps {
  onAction: (action: PlayerAction, raiseAmount?: number) => void;
  disabled?: boolean;
  canCheck: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
}

export default function ActionBar({
  onAction,
  disabled = false,
  canCheck,
  callAmount,
  minRaise,
  maxRaise,
  playerChips,
}: ActionBarProps) {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  // Reset raise amount when minRaise changes
  useEffect(() => {
    setRaiseAmount(minRaise);
  }, [minRaise]);

  // Close slider when disabled
  useEffect(() => {
    if (disabled) setShowRaiseSlider(false);
  }, [disabled]);

  const handleFold = useCallback(() => {
    if (!disabled) onAction('fold');
  }, [disabled, onAction]);

  const handleCheckCall = useCallback(() => {
    if (disabled) return;
    if (canCheck) {
      onAction('check');
    } else if (callAmount >= playerChips) {
      onAction('all-in');
    } else {
      onAction('call');
    }
  }, [disabled, canCheck, callAmount, playerChips, onAction]);

  const handleRaiseClick = useCallback(() => {
    if (!disabled) setShowRaiseSlider((prev) => !prev);
  }, [disabled]);

  const handleConfirmRaise = useCallback(() => {
    if (raiseAmount >= maxRaise || raiseAmount >= playerChips) {
      onAction('all-in');
    } else {
      onAction('raise', raiseAmount);
    }
    setShowRaiseSlider(false);
  }, [raiseAmount, maxRaise, playerChips, onAction]);

  const handleCancelRaise = useCallback(() => {
    setShowRaiseSlider(false);
    setRaiseAmount(minRaise);
  }, [minRaise]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (key === 'f') handleFold();
      else if (key === 'c') handleCheckCall();
      else if (key === 'r') handleRaiseClick();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleFold, handleCheckCall, handleRaiseClick]);

  const checkCallLabel = canCheck
    ? 'Check'
    : callAmount >= playerChips
      ? `All-In $${playerChips.toLocaleString()}`
      : `Call $${callAmount.toLocaleString()}`;

  return (
    <motion.div
      variants={uiVariants.actionBar as import('framer-motion').Variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col gap-2 w-full max-w-lg mx-auto"
    >
      {/* Raise slider */}
      <AnimatePresence>
        {showRaiseSlider && !disabled && (
          <RaiseSlider
            min={minRaise}
            max={Math.min(maxRaise, playerChips)}
            value={raiseAmount}
            onChange={setRaiseAmount}
            onConfirm={handleConfirmRaise}
            onCancel={handleCancelRaise}
          />
        )}
      </AnimatePresence>

      {/* Disabled overlay message */}
      {disabled ? (
        <div className="flex items-center justify-center py-2 px-4 rounded-xl bg-[#07060a]/80 border border-[#1a1a2e]/40 backdrop-blur-sm">
          <motion.span
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[#f0e8d0]/40 text-xs sm:text-sm uppercase tracking-widest font-medium"
          >
            Opponent&apos;s turn...
          </motion.span>
        </div>
      ) : (
        /* Action buttons */
        <div className="flex gap-1.5 sm:gap-2">
          {/* Fold */}
          <motion.button
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            onClick={handleFold}
            className="flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-b from-[#c41e3a] to-[#8b1528] border border-[#c41e3a]/30 shadow-[0_2px_8px_rgba(196,30,58,0.3)]"
          >
            <span className="flex items-center justify-center gap-1">
              Fold
              <kbd className="hidden sm:inline text-[10px] opacity-50 font-normal border border-white/20 rounded px-1">F</kbd>
            </span>
          </motion.button>

          {/* Check / Call */}
          <motion.button
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            onClick={handleCheckCall}
            className="flex-[1.5] py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-b from-[#2d6a4f] to-[#1a472a] border border-[#2d6a4f]/30 shadow-[0_2px_8px_rgba(45,106,79,0.3)]"
          >
            <span className="flex items-center justify-center gap-1">
              {checkCallLabel}
              <kbd className="hidden sm:inline text-[10px] opacity-50 font-normal border border-white/20 rounded px-1">C</kbd>
            </span>
          </motion.button>

          {/* Raise */}
          <motion.button
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            onClick={handleRaiseClick}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-[#07060a] bg-gradient-to-b from-[#f0d060] via-[#d4af37] to-[#b8941e] border border-[#f0d060]/30 shadow-[0_2px_8px_rgba(212,175,55,0.3)] ${
              showRaiseSlider ? 'ring-2 ring-[#d4af37]/60' : ''
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              Raise
              <kbd className="hidden sm:inline text-[10px] opacity-50 font-normal border border-[#07060a]/30 rounded px-1">R</kbd>
            </span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
