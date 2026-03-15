'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TableSpotlightProps {
  active: boolean;
}

export default function TableSpotlight({ active }: TableSpotlightProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="table-spotlight"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(212,175,55,0.25) 0%, rgba(240,208,96,0.1) 35%, transparent 65%)',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.3, 0.15],
            scale: [0.5, 1.2, 1],
            transition: { duration: 1.2, ease: 'easeOut' as const },
          }}
          exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
        />
      )}
    </AnimatePresence>
  );
}
