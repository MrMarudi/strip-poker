"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useGameStore } from "@/store/gameStore";
import { useShopStore } from "@/store/shopStore";
import { uiVariants, stagger } from "@/animations/specs";
import charactersData from "@/data/characters.json";

const personalityColors: Record<string, { bg: string; text: string }> = {
  tease: { bg: "bg-pink-500/20", text: "text-pink-400" },
  shy: { bg: "bg-sky-500/20", text: "text-sky-400" },
  cocky: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

function DifficultyStars({ level }: { level: string }) {
  const count = level === "easy" ? 1 : level === "medium" ? 2 : 3;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= count ? "#d4af37" : "none"}
          stroke={i <= count ? "#d4af37" : "#ffffff30"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1.5 text-white/40 text-xs capitalize">{level}</span>
    </div>
  );
}

const cardVariant = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] as const },
  },
};

export default function SelectPage() {
  const router = useRouter();
  const selectCharacter = useGameStore((s) => s.selectCharacter);
  const isCharacterUnlocked = useShopStore((s) => s.isCharacterUnlocked);

  const handleSelect = (character: (typeof charactersData.characters)[0]) => {
    if (!isCharacterUnlocked(character.id)) {
      router.push("/shop");
      return;
    }
    selectCharacter(character.id);
    router.push("/game");
  };

  return (
    <motion.main
      variants={uiVariants.pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-dvh flex flex-col items-center bg-felt-dark px-4 py-8 sm:py-12 overflow-y-auto"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d4af37]/5 blur-[100px] pointer-events-none" />

      {/* Back button */}
      <div className="relative z-10 w-full max-w-5xl mb-8">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-[#d4af37]/60 hover:text-[#d4af37] transition-colors font-playfair tracking-wider"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK
          </motion.button>
        </Link>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-10"
      >
        <h1 className="font-playfair text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#b8941e] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
          Choose Your Opponent
        </h1>
        <p className="mt-3 text-[#f0e8d0]/40 text-sm tracking-widest uppercase">
          Select a character to begin
        </p>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mb-10"
      />

      {/* Character Grid */}
      <motion.div
        variants={{ animate: { transition: stagger.characterGrid } }}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
      >
        {charactersData.characters.map((character) => {
          const colors = personalityColors[character.personality] ?? {
            bg: "bg-white/10",
            text: "text-white/60",
          };
          const unlocked = isCharacterUnlocked(character.id);

          return (
            <motion.div
              key={character.id}
              variants={cardVariant}
              whileHover={unlocked ? { y: -8, scale: 1.03 } : {}}
              whileTap={unlocked ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(character)}
              className={`relative group rounded-2xl border overflow-hidden transition-all ${
                unlocked
                  ? "border-[#d4af37]/20 hover:border-[#d4af37]/50 cursor-pointer bg-black/30 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                  : "border-white/5 cursor-pointer bg-black/40 hover:border-[#d4af37]/20"
              }`}
            >
              {/* Hero Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={character.heroImage}
                  alt={character.displayName}
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    unlocked
                      ? "group-hover:scale-110"
                      : "grayscale brightness-50"
                  }`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Locked overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-60"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[#d4af37]/70 text-xs font-playfair tracking-wider uppercase">
                      Premium
                    </span>
                  </div>
                )}

                {/* Bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              {/* Info section */}
              <div className="p-3 pb-4 space-y-2">
                {/* Name */}
                <h3 className="font-playfair text-lg font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
                  {character.displayName}
                </h3>

                {/* Personality badge */}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${colors.bg} ${colors.text}`}
                >
                  {character.personality}
                </span>

                {/* Difficulty */}
                <DifficultyStars level={character.difficulty} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Shop link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-10"
      >
        <Link
          href="/shop"
          className="text-[#d4af37]/50 hover:text-[#d4af37] text-sm font-playfair tracking-wider transition-colors"
        >
          Want more characters?{" "}
          <span className="underline underline-offset-4 decoration-[#d4af37]/30 hover:decoration-[#d4af37]/60">
            Visit the VIP Shop
          </span>
        </Link>
      </motion.div>
    </motion.main>
  );
}
