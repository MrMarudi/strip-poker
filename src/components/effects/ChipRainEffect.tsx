'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChipRainEffectProps {
  active: boolean;
  chipCount?: number;
}

const CHIP_COLORS = ['#d4af37', '#c41e3a', '#2d6a4f', '#3b5998'];

interface Chip {
  id: number;
  x: number;
  drift: number;
  delay: number;
  color: string;
  size: number;
  rotateDir: number;
  fallDuration: number;
}

export default function ChipRainEffect({ active, chipCount = 15 }: ChipRainEffectProps) {
  const [visible, setVisible] = useState(false);

  const chips: Chip[] = useMemo(() => {
    if (!active) return [];
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return Array.from({ length: chipCount }, (_, i) => ({
      id: i,
      x: Math.random() * screenW,
      drift: (Math.random() - 0.5) * 40,
      delay: Math.random() * 0.8,
      color: CHIP_COLORS[i % CHIP_COLORS.length],
      size: 10 + Math.random() * 10,
      rotateDir: Math.random() > 0.5 ? 360 : -360,
      fallDuration: 2 + Math.random(),
    }));
  }, [active, chipCount]);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active]);

  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {chips.map((chip) => (
            <motion.div
              key={chip.id}
              className="absolute rounded-full"
              style={{
                width: chip.size,
                height: chip.size,
                backgroundColor: chip.color,
                boxShadow:
                  '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              initial={{
                y: -50,
                x: chip.x,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: screenH,
                x: chip.x + chip.drift,
                opacity: [0, 1, 1, 0],
                rotate: chip.rotateDir,
                transition: {
                  duration: chip.fallDuration,
                  delay: chip.delay,
                  ease: 'easeIn' as const,
                },
              }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
