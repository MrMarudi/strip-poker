'use client';

import { motion } from 'framer-motion';
import { uiVariants } from '@/animations/specs';

interface RaiseSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RaiseSlider({
  min,
  max,
  value,
  onChange,
  onConfirm,
  onCancel,
}: RaiseSliderProps) {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const setQuickBet = (fraction: number) => {
    const amount = Math.min(Math.round(max * fraction), max);
    onChange(Math.max(amount, min));
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-3 px-4 py-3 bg-[#07060a]/90 border border-[#d4af37]/20 rounded-xl backdrop-blur-sm">
        {/* Current raise amount */}
        <div className="text-center">
          <span className="text-[#f0e8d0]/60 text-xs uppercase tracking-wider">Raise to</span>
          <div className="text-2xl font-bold text-[#d4af37]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            ${value.toLocaleString()}
          </div>
        </div>

        {/* Slider */}
        <div className="relative flex items-center gap-3">
          <span className="text-xs text-[#f0e8d0]/50 w-12 text-right">${min}</span>
          <div className="relative flex-1 h-8 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#1a1a2e]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b8941e] to-[#d4af37]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute w-5 h-5 rounded-full bg-[#d4af37] border-2 border-[#f0d060] shadow-[0_0_8px_rgba(212,175,55,0.5)] pointer-events-none"
              style={{ left: `calc(${percentage}% - 10px)` }}
            />
          </div>
          <span className="text-xs text-[#f0e8d0]/50 w-12">${max}</span>
        </div>

        {/* Quick-bet buttons */}
        <div className="flex gap-2 justify-center">
          {[
            { label: '1/2 Pot', fraction: 0.5 },
            { label: 'Pot', fraction: 1 },
            { label: 'All-In', fraction: Infinity },
          ].map(({ label, fraction }) => (
            <motion.button
              key={label}
              whileHover={uiVariants.button.hover}
              whileTap={uiVariants.button.tap}
              onClick={() => fraction === Infinity ? onChange(max) : setQuickBet(fraction)}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#d4af37]/30 text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 transition-colors"
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Confirm / Cancel */}
        <div className="flex gap-2">
          <motion.button
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-semibold uppercase tracking-wider text-[#f0e8d0]/60 bg-[#1a1a2e] border border-[#f0e8d0]/10 hover:bg-[#1a1a2e]/80 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            onClick={onConfirm}
            className="flex-[2] py-2 rounded-xl text-sm font-bold uppercase tracking-wider text-[#07060a] bg-gradient-to-r from-[#b8941e] via-[#d4af37] to-[#f0d060] shadow-[0_0_12px_rgba(212,175,55,0.3)]"
          >
            Confirm Raise
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
