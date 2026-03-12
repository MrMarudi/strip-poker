"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

const cardBackStyles = [
  { value: "classic" as const, label: "Classic", desc: "Red & Gold Diamond" },
  { value: "elegant" as const, label: "Elegant", desc: "Purple & Gold Ornate" },
  { value: "modern" as const, label: "Modern", desc: "Blue & Silver Geometric" },
];

const difficulties = [
  { value: "easy" as const, label: "Easy", desc: "NPC plays loosely, makes frequent mistakes" },
  { value: "medium" as const, label: "Medium", desc: "NPC plays reasonably, occasional bluffs" },
  { value: "hard" as const, label: "Hard", desc: "NPC plays aggressively, smart bets" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-felt-dark px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#d4af37]/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <h1 className="font-playfair text-4xl font-bold gold-shimmer text-center mb-8">
          Settings
        </h1>

        <div className="space-y-8">
          {/* Sound Toggle */}
          <div className="bg-black/20 rounded-xl p-5 border border-[#d4af37]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#d4af37] font-playfair text-lg">Sound</h3>
                <p className="text-white/40 text-sm mt-1">Game sound effects</p>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.soundEnabled ? "bg-[#d4af37]" : "bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: settings.soundEnabled ? 28 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
                />
              </button>
            </div>
          </div>

          {/* Card Back Style */}
          <div className="bg-black/20 rounded-xl p-5 border border-[#d4af37]/10">
            <h3 className="text-[#d4af37] font-playfair text-lg mb-3">Card Back Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {cardBackStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateSettings({ cardBackStyle: style.value })}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    settings.cardBackStyle === style.value
                      ? "border-[#d4af37] bg-[#d4af37]/10"
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
                  <p className="text-white text-xs font-medium">{style.label}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-black/20 rounded-xl p-5 border border-[#d4af37]/10">
            <h3 className="text-[#d4af37] font-playfair text-lg mb-3">Difficulty</h3>
            <div className="space-y-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => updateSettings({ difficulty: diff.value })}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    settings.difficulty === diff.value
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-white font-medium">{diff.label}</span>
                  <span className="text-white/40 text-sm ml-3">{diff.desc}</span>
                </button>
              ))}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-3 rounded-xl font-playfair text-lg tracking-wider text-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/5 transition-all"
            >
              BACK
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
