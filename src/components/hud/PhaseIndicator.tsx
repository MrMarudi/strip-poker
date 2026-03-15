'use client';

import { motion } from 'framer-motion';
import { uiVariants } from '@/animations/specs';
import type { GamePhase } from '@/game/types';

const PHASES: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const PHASE_LABELS: Record<GamePhase, string> = {
  idle: 'Idle',
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

function getPhaseState(
  phase: GamePhase,
  currentPhase: GamePhase
): 'active' | 'complete' | 'inactive' {
  const currentIdx = PHASES.indexOf(currentPhase);
  const phaseIdx = PHASES.indexOf(phase);
  if (phaseIdx === currentIdx) return 'active';
  if (phaseIdx < currentIdx) return 'complete';
  return 'inactive';
}

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
}

export default function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-3 px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-full bg-[#07060a]/80 border border-[#d4af37]/20 backdrop-blur-sm">
      {PHASES.map((phase, idx) => {
        const state = getPhaseState(phase, currentPhase);
        const variant = uiVariants.phaseIndicator[state];

        return (
          <div key={phase} className="flex items-center gap-0.5 sm:gap-3">
            <div className="flex flex-col items-center gap-0">
              <motion.div
                initial={false}
                animate={{
                  scale: variant.scale,
                  opacity: variant.opacity,
                  ...('transition' in variant ? { transition: variant.transition } : {}),
                } as import('framer-motion').TargetAndTransition}
                className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${
                  state === 'active'
                    ? 'bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : state === 'complete'
                      ? 'bg-[#b8941e]'
                      : 'bg-[#1a1a2e]'
                }`}
              />
              <span
                className={`text-[7px] sm:text-[10px] uppercase tracking-wider font-medium ${
                  state === 'active'
                    ? 'text-[#d4af37]'
                    : state === 'complete'
                      ? 'text-[#b8941e]/70'
                      : 'text-[#f0e8d0]/30'
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            </div>
            {idx < PHASES.length - 1 && (
              <div
                className={`w-1.5 sm:w-6 h-px ${
                  state === 'complete' || state === 'active'
                    ? 'bg-[#d4af37]/40'
                    : 'bg-[#1a1a2e]/60'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
