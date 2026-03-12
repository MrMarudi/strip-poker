"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import FloatingCards from "@/components/ui/FloatingCards";
import { useSettings } from "@/context/SettingsContext";

const GoldParticles = dynamic(() => import("@/components/ui/GoldParticles"), {
  ssr: false,
});

export default function HomePage() {
  const { settings, updateSettings } = useSettings();
  const [nameInput, setNameInput] = useState(settings.playerName);
  const [showNameInput, setShowNameInput] = useState(false);

  const handlePlay = () => {
    if (settings.playerName === "Guest" && !showNameInput) {
      setShowNameInput(true);
      return;
    }
    if (nameInput.trim()) {
      updateSettings({ playerName: nameInput.trim() });
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-felt-dark">
      <GoldParticles />
      <FloatingCards />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#d4af37]/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="font-playfair text-6xl md:text-8xl font-black gold-shimmer tracking-tight">
            Texas
          </h1>
          <h1 className="font-playfair text-5xl md:text-7xl font-black gold-shimmer tracking-tight -mt-2">
            Hold&apos;em
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 text-[#d4af37]/60 text-lg tracking-[0.3em] uppercase"
          >
            Poker Night
          </motion.p>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-48 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
        />

        {/* Name input */}
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <label className="text-[#d4af37]/70 text-sm uppercase tracking-widest">
              Enter your name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              className="bg-black/30 border border-[#d4af37]/30 rounded-lg px-4 py-2 text-center text-white text-lg focus:outline-none focus:border-[#d4af37]/60 transition-colors w-64"
              placeholder="Guest"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePlay();
              }}
            />
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          {!showNameInput ? (
            <motion.button
              onClick={handlePlay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-16 py-4 rounded-xl font-playfair text-2xl font-bold tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] to-[#d4af37] glow-gold-strong transition-all"
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                PLAY
              </motion.span>
            </motion.button>
          ) : (
            <Link href="/game">
              <motion.button
                onClick={() => {
                  if (nameInput.trim()) {
                    updateSettings({ playerName: nameInput.trim() });
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-16 py-4 rounded-xl font-playfair text-2xl font-bold tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] to-[#d4af37] glow-gold-strong transition-all"
              >
                START GAME
              </motion.button>
            </Link>
          )}

          <Link href="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-3 rounded-xl font-playfair text-lg tracking-wider text-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/5 transition-all"
            >
              SETTINGS
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-white/20 text-xs tracking-widest uppercase"
        >
          Guest Mode
        </motion.p>
      </div>
    </main>
  );
}
