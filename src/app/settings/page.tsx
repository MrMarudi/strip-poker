"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useGameStore } from "@/store/gameStore";
import { uiVariants } from "@/animations/specs";

const cardBackStyles = [
  { value: "classic" as const, label: "Classic", desc: "Red & Gold Diamond" },
  {
    value: "elegant" as const,
    label: "Elegant",
    desc: "Purple & Gold Ornate",
  },
  {
    value: "modern" as const,
    label: "Modern",
    desc: "Blue & Silver Geometric",
  },
];

const difficulties = [
  {
    value: "easy" as const,
    label: "Easy",
    desc: "NPC plays loosely, makes frequent mistakes",
  },
  {
    value: "medium" as const,
    label: "Medium",
    desc: "NPC plays reasonably, occasional bluffs",
  },
  {
    value: "hard" as const,
    label: "Hard",
    desc: "NPC plays aggressively, smart bets",
  },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const resetAllProgress = useGameStore((s) => s.resetAllProgress);
  const [nameInput, setNameInput] = useState(settings.playerName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleNameChange = (value: string) => {
    setNameInput(value);
    if (value.trim()) {
      updateSettings({ playerName: value.trim() });
    }
  };

  const handleReset = () => {
    resetAllProgress();
    setShowResetConfirm(false);
  };

  return (
    <motion.main
      variants={uiVariants.pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-screen flex flex-col items-center justify-center bg-felt-dark px-4 py-6"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#d4af37]/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent text-center mb-5">
          Settings
        </h1>

        <div className="space-y-4">
          {/* Player Name */}
          <div className="bg-black/20 rounded-2xl p-4 border border-[#d4af37]/10">
            <h3 className="text-[#d4af37] font-playfair text-lg mb-3">
              Player Name
            </h3>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={20}
              className="w-full bg-black/30 border border-[#d4af37]/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#d4af37]/50 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all placeholder:text-white/20"
              placeholder="Enter your name"
            />
          </div>

          {/* Sound Toggle */}
          <div className="bg-black/20 rounded-2xl p-4 border border-[#d4af37]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#d4af37] font-playfair text-lg">Sound</h3>
                <p className="text-white/40 text-sm mt-1">
                  Game sound effects
                </p>
              </div>
              <button
                onClick={() =>
                  updateSettings({ soundEnabled: !settings.soundEnabled })
                }
                className={`relative w-14 h-7 rounded-full transition-all ${
                  settings.soundEnabled
                    ? "bg-gradient-to-r from-[#b8941e] to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                    : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: settings.soundEnabled ? 28 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          </div>

          {/* Card Back Style */}
          <div className="bg-black/20 rounded-2xl p-4 border border-[#d4af37]/10">
            <h3 className="text-[#d4af37] font-playfair text-lg mb-3">
              Card Back Style
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {cardBackStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateSettings({ cardBackStyle: style.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    settings.cardBackStyle === style.value
                      ? "border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-10 h-14 mx-auto rounded-md mb-2 ${
                      style.value === "classic"
                        ? "bg-gradient-to-br from-[#8b0000] to-[#5c0000] border border-[#d4af37]/40"
                        : style.value === "elegant"
                        ? "bg-gradient-to-br from-[#2d1b4e] to-[#1a0f30] border border-[#d4af37]/40"
                        : "bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2a] border border-white/20"
                    }`}
                  />
                  <p className="text-white text-xs font-medium">
                    {style.label}
                  </p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {style.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-black/20 rounded-2xl p-4 border border-[#d4af37]/10">
            <h3 className="text-[#d4af37] font-playfair text-lg mb-3">
              Difficulty
            </h3>
            <div className="space-y-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => updateSettings({ difficulty: diff.value })}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    settings.difficulty === diff.value
                      ? "border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-white font-medium">{diff.label}</span>
                  <span className="text-white/40 text-sm ml-3">
                    {diff.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Progress */}
          <div className="bg-black/20 rounded-2xl p-4 border border-[#c41e3a]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#c41e3a] font-playfair text-lg">
                  Reset Progress
                </h3>
                <p className="text-white/40 text-sm mt-1">
                  Clear all saved game data
                </p>
              </div>
              {!showResetConfirm ? (
                <motion.button
                  onClick={() => setShowResetConfirm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#c41e3a] border border-[#c41e3a]/30 hover:border-[#c41e3a]/60 hover:bg-[#c41e3a]/5 transition-all"
                >
                  Reset
                </motion.button>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleReset}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-[#c41e3a] hover:bg-[#a01830] transition-colors"
                  >
                    Confirm
                  </motion.button>
                  <motion.button
                    onClick={() => setShowResetConfirm(false)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <motion.button
              whileHover={uiVariants.button.hover}
              whileTap={uiVariants.button.tap}
              className="px-10 py-3 rounded-xl font-playfair text-lg tracking-wider text-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/5 transition-all"
            >
              BACK
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
