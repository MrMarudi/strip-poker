'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useShopStore, PRODUCTS, DAILY_BONUS_CHIPS } from '@/store/shopStore';
import { useGameStore } from '@/store/gameStore';
import type { ShopProduct } from '@/store/shopStore';

// ── Helpers ─────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ── Section header ──────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#f0e8d0]/80 tracking-wider uppercase">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
    </div>
  );
}

// ── Product card ────────────────────────────────────────────────────

function ProductCard({
  product,
  owned,
  onBuy,
}: {
  product: ShopProduct;
  owned: boolean;
  onBuy: (product: ShopProduct) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={owned ? {} : { y: -4, scale: 1.02 }}
      className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
        owned
          ? 'border-[#d4af37]/30 bg-[#d4af37]/5'
          : 'border-[#d4af37]/15 bg-black/30 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]'
      }`}
    >
      {/* Owned badge */}
      {owned && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40">
          <span className="text-[#d4af37] text-xs font-bold tracking-wider uppercase">
            Owned
          </span>
        </div>
      )}

      {/* Product info */}
      <h3 className="font-playfair text-lg font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
        {product.name}
      </h3>
      <p className="text-[#f0e8d0]/50 text-sm leading-relaxed">
        {product.description}
      </p>

      {/* Price / Buy */}
      {!owned && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBuy(product)}
          className="mt-auto self-start px-5 py-2.5 rounded-xl font-playfair font-bold text-sm tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] via-[#e8c84a] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] border border-[#f0d060]/50 transition-shadow"
        >
          {product.priceDisplay}
        </motion.button>
      )}

      {/* Bundle savings badge */}
      {product.type === 'bundle' && !owned && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#c41e3a] text-white text-[10px] font-bold tracking-wider uppercase shadow-lg">
          Save 66%
        </span>
      )}
    </motion.div>
  );
}

// ── Coming Soon modal ───────────────────────────────────────────────

function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[#d4af37]/30 bg-gradient-to-b from-[#1a1a2e] to-[#0d0518] p-8 text-center shadow-[0_0_40px_rgba(212,175,55,0.15)]"
      >
        {/* Diamond icon */}
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d4af37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 22 8.5 12 22 2 8.5" />
            <line x1="2" y1="8.5" x2="22" y2="8.5" />
            <line x1="12" y1="2" x2="7" y2="8.5" />
            <line x1="12" y1="2" x2="17" y2="8.5" />
            <line x1="7" y1="8.5" x2="12" y2="22" />
            <line x1="17" y1="8.5" x2="12" y2="22" />
          </svg>
        </div>

        <h3 className="font-playfair text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent mb-3">
          Coming Soon
        </h3>
        <p className="text-[#f0e8d0]/50 text-sm leading-relaxed mb-6">
          Payment integration coming soon! Stay tuned.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-8 py-2.5 rounded-xl font-playfair font-bold text-sm tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] via-[#e8c84a] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)] border border-[#f0d060]/50"
        >
          GOT IT
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Shop Page ──────────────────────────────────────────────────

export default function ShopPage() {
  const {
    unlockedCharacters,
    isCharacterUnlocked,
    canClaimDailyBonus,
    claimDailyBonus,
    getMillisUntilNextBonus,
    trackPurchaseIntent,
  } = useShopStore();

  const updateChips = useGameStore((s) => s.updateChips);
  const playerChips = useGameStore((s) => s.playerChips);
  const opponentChips = useGameStore((s) => s.opponentChips);

  const [showModal, setShowModal] = useState(false);
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // Refresh bonus state
  const refreshBonus = useCallback(() => {
    const available = canClaimDailyBonus();
    setBonusAvailable(available);
    if (!available) {
      const ms = getMillisUntilNextBonus();
      setCountdown(formatCountdown(ms));
    }
  }, [canClaimDailyBonus, getMillisUntilNextBonus]);

  useEffect(() => {
    refreshBonus();
    const interval = setInterval(refreshBonus, 1000);
    return () => clearInterval(interval);
  }, [refreshBonus]);

  const handleBuy = (product: ShopProduct) => {
    trackPurchaseIntent(product.id);
    setShowModal(true);
  };

  const handleClaimBonus = () => {
    const success = claimDailyBonus();
    if (success) {
      updateChips(playerChips + DAILY_BONUS_CHIPS, opponentChips);
      setBonusClaimed(true);
      setTimeout(() => setBonusClaimed(false), 2000);
      refreshBonus();
    }
  };

  // Split products by type
  const characterProducts = PRODUCTS.filter((p) => p.type === 'character');
  const bundleProducts = PRODUCTS.filter((p) => p.type === 'bundle');
  const chipProducts = PRODUCTS.filter((p) => p.type === 'chips');

  // Check if all characters are owned (for bundle)
  const allOwned = ['luna', 'emma', 'sakura', 'valentina', 'zara'].every((id) =>
    unlockedCharacters.includes(id)
  );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-dvh flex flex-col items-center bg-felt-dark px-4 py-8 sm:py-12 overflow-y-auto"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d4af37]/5 blur-[100px] pointer-events-none" />

      {/* Back button */}
      <div className="relative z-10 w-full max-w-3xl mb-8">
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
        className="relative z-10 text-center mb-6"
      >
        <h1 className="font-playfair text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#b8941e] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
          VIP Shop
        </h1>
        <p className="mt-3 text-[#f0e8d0]/40 text-sm tracking-widest uppercase">
          Exclusive upgrades & rewards
        </p>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mb-10"
      />

      <div className="relative z-10 w-full max-w-3xl space-y-12">
        {/* ── Daily Bonus ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-[#d4af37]/10 to-transparent p-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Gift icon */}
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-playfair text-lg font-bold text-[#f0e8d0]/90">
                  Daily Bonus
                </h3>
                <p className="text-[#f0e8d0]/40 text-sm">
                  {DAILY_BONUS_CHIPS.toLocaleString()} free chips every 24 hours
                </p>
              </div>
            </div>

            {bonusClaimed ? (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-5 py-2.5 rounded-xl font-playfair font-bold text-sm tracking-wider text-[#d4af37]"
              >
                +{DAILY_BONUS_CHIPS} Claimed!
              </motion.span>
            ) : bonusAvailable ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimBonus}
                className="px-6 py-2.5 rounded-xl font-playfair font-bold text-sm tracking-wider text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] via-[#e8c84a] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] border border-[#f0d060]/50 transition-shadow"
              >
                CLAIM
              </motion.button>
            ) : (
              <div className="text-center">
                <span className="text-[#f0e8d0]/30 text-xs tracking-wider uppercase block mb-1">
                  Next bonus in
                </span>
                <span className="font-mono text-[#d4af37]/70 text-lg">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Characters ───────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Premium Characters" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {characterProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                owned={product.characterId ? isCharacterUnlocked(product.characterId) : false}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </section>

        {/* ── Bundles ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Bundles" />
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {bundleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                owned={allOwned}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </section>

        {/* ── Chip Packs ───────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Chip Packs" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {chipProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                owned={false}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Footer spacing */}
      <div className="h-12" />

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showModal && <ComingSoonModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.main>
  );
}
