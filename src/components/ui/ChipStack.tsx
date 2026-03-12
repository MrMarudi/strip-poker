"use client";

import { motion } from "framer-motion";

interface ChipStackProps {
  amount: number;
  size?: "sm" | "md";
}

export default function ChipStack({ amount, size = "md" }: ChipStackProps) {
  const chipSize = size === "sm" ? "w-6 h-6 text-[8px]" : "w-8 h-8 text-[10px]";

  return (
    <motion.div
      className="flex items-center gap-1.5"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={amount}
    >
      {/* Chip icon */}
      <div className={`${chipSize} rounded-full bg-gradient-to-b from-[#d4af37] to-[#b8941f] border-2 border-[#f0d060] flex items-center justify-center font-bold text-[#0a1f0a] shadow-md`}>
        $
      </div>
      <span className={`font-bold ${size === "sm" ? "text-sm" : "text-base"} text-[#d4af37]`}>
        {amount.toLocaleString()}
      </span>
    </motion.div>
  );
}
