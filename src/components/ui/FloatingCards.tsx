"use client";

import { motion } from "framer-motion";

const suits = ["♠", "♥", "♦", "♣"];
const colors = ["#1a1a2e", "#dc2626", "#dc2626", "#1a1a2e"];

function FloatingCard({ index }: { index: number }) {
  const suit = suits[index % 4];
  const color = colors[index % 4];
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = 15 + Math.random() * 20;
  const delay = Math.random() * 5;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      initial={{ opacity: 0, rotateY: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        rotateY: [0, 180, 360],
        y: [0, -30, 0, 30, 0],
        x: [0, 20, 0, -20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="w-12 h-17 rounded-md bg-white/5 border border-[#d4af37]/20 flex items-center justify-center backdrop-blur-sm">
        <span className="text-xl" style={{ color, opacity: 0.6 }}>
          {suit}
        </span>
      </div>
    </motion.div>
  );
}

export default function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }, (_, i) => (
        <FloatingCard key={i} index={i} />
      ))}
    </div>
  );
}
