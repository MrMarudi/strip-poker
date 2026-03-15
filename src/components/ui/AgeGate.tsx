"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { uiVariants } from "@/animations/specs";

export default function AgeGate() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const verified = localStorage.getItem("age-verified");
    if (!verified) {
      setShow(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("age-verified", "true");
    setShow(false);
  };

  const handleExit = () => {
    if (typeof window !== "undefined") {
      window.location.href = "https://www.google.com";
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative w-full max-w-md mx-4 p-8 rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#1a1a2e] to-[#0a0a1a] shadow-[0_0_40px_rgba(212,175,55,0.15)]"
          >
            {/* Decorative top line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 w-16 h-16 rounded-full border-2 border-[#d4af37]/40 flex items-center justify-center">
                <span className="text-[#d4af37] text-2xl font-playfair font-bold">
                  18+
                </span>
              </div>

              <h2 className="font-playfair text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent mb-3">
                Age Verification
              </h2>

              <p className="text-[#f0e8d0]/60 text-sm leading-relaxed mb-8">
                This game contains mature content. You must be 18 years or older
                to play.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={handleConfirm}
                  whileHover={uiVariants.button.hover}
                  whileTap={uiVariants.button.tap}
                  className="w-full py-3 rounded-xl font-playfair text-lg font-bold tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] to-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-shadow"
                >
                  I am 18 or older
                </motion.button>

                <motion.button
                  onClick={handleExit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-playfair text-lg tracking-wider text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all"
                >
                  Exit
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
