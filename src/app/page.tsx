"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import FloatingCards from "@/components/ui/FloatingCards";
import { uiVariants } from "@/animations/specs";

const GoldParticles = dynamic(() => import("@/components/ui/GoldParticles"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();

  return (
    <motion.main
      variants={uiVariants.pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative h-dvh flex flex-col items-center justify-center overflow-hidden bg-felt-dark"
    >
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
          <h1 className="font-playfair text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-[#b8941e] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent drop-shadow-lg">
            STRIP POKER
          </h1>
          <h1 className="font-playfair text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8941e] bg-clip-text text-transparent -mt-1">
            VIP
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 text-[#f0e8d0]/60 text-lg tracking-[0.3em] uppercase"
          >
            An Exclusive Experience
          </motion.p>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-48 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
        />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <motion.button
            onClick={() => router.push("/select")}
            whileHover={uiVariants.button.hover}
            whileTap={uiVariants.button.tap}
            className="relative px-16 py-4 rounded-xl font-playfair text-2xl font-bold tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] via-[#e8c84a] to-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3),0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6),0_6px_20px_rgba(0,0,0,0.5)] border border-[#f0d060]/50 transition-shadow"
          >
            <motion.span
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              PLAY
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-white/20 text-xs tracking-widest uppercase"
        >
          18+ Only
        </motion.p>
      </div>

      {/* Shop icon — bottom left */}
      <Link href="/shop">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 left-6 z-20 w-12 h-12 rounded-full border border-[#d4af37]/30 bg-black/40 backdrop-blur-sm flex items-center justify-center text-[#d4af37]/70 hover:text-[#d4af37] hover:border-[#d4af37]/60 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </motion.div>
      </Link>

      {/* Settings gear icon — bottom right */}
      <Link href="/settings">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-20 w-12 h-12 rounded-full border border-[#d4af37]/30 bg-black/40 backdrop-blur-sm flex items-center justify-center text-[#d4af37]/70 hover:text-[#d4af37] hover:border-[#d4af37]/60 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </motion.div>
      </Link>
    </motion.main>
  );
}
