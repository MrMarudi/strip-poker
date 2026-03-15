"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import AnimatedCard from "@/components/cards/AnimatedCard";
import ChipStack from "@/components/ui/ChipStack";
import NPCAvatar from "@/components/ui/NPCAvatar";
import {
  createInitialState,
  startNewRound,
  handlePlayerAction,
  advancePhase,
} from "@/game/engine";
import { getNPCAction } from "@/game/npc";
import type { GameState, PlayerAction } from "@/game/types";

export default function GamePage() {
  const { settings } = useSettings();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [raiseAmount, setRaiseAmount] = useState(20);
  const [showResult, setShowResult] = useState(false);
  const [animatingPhase, setAnimatingPhase] = useState(false);
  const npcTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actedThisStreetRef = useRef<Set<number>>(new Set());

  // Initialize game
  useEffect(() => {
    const state = createInitialState(settings.playerName);
    const started = startNewRound(state);
    setGameState(started);
    actedThisStreetRef.current = new Set();
  }, [settings.playerName]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
    };
  }, []);

  const player = gameState?.players[0];
  const npc = gameState?.players[1];
  const isPlayerTurn = gameState?.currentPlayerIndex === 0;
  const canAct = isPlayerTurn && !gameState?.roundOver && !animatingPhase && gameState?.phase !== "idle" && gameState?.phase !== "showdown";

  const callAmount = gameState && npc && player
    ? Math.max(0, Math.max(...gameState.players.map(p => p.currentBet)) - player.currentBet)
    : 0;

  const minRaise = gameState ? gameState.bigBlind : 10;
  const maxRaise = player ? player.chips : 100;

  // Check if betting round is complete
  const shouldAdvancePhase = useCallback((state: GameState, acted: Set<number>): boolean => {
    const nonFolded = state.players.filter(p => !p.folded);
    if (nonFolded.length <= 1) return false;

    // All non-folded players with chips must have equal bets (or be all-in)
    const highestBet = Math.max(...nonFolded.map(p => p.currentBet));
    for (const p of nonFolded) {
      if (p.chips > 0 && p.currentBet < highestBet) return false;
    }

    // All non-folded players who can still act must have acted this street
    const mustAct = state.players
      .map((p, i) => ({ player: p, index: i }))
      .filter(({ player: p }) => !p.folded && p.chips > 0);

    return mustAct.every(({ index }) => acted.has(index));
  }, []);

  // Process NPC turn
  const processNPCTurn = useCallback((state: GameState) => {
    if (state.roundOver || state.phase === "showdown" || state.phase === "idle") return;
    if (state.currentPlayerIndex !== 1) return;

    const timer = setTimeout(() => {
      npcTimerRef.current = null;

      const actingIndex = 1;
      const prevHighest = Math.max(...state.players.map(p => p.currentBet));
      const { action, amount } = getNPCAction(state, 1, settings.difficulty);
      const newState = handlePlayerAction(state, action, amount);

      // Update acted tracking
      const acted = actedThisStreetRef.current;
      const actingPlayer = newState.players[actingIndex];
      const isRaise = action === "raise" ||
        (action === "all-in" && actingPlayer.currentBet > prevHighest);
      if (isRaise) {
        acted.clear();
      }
      acted.add(actingIndex);

      // 1. Check if round ended (someone folded or engine detected end)
      if (newState.roundOver) {
        setGameState(newState);
        setShowResult(true);
        return;
      }

      // 2. Check if betting round is complete → advance phase
      if (shouldAdvancePhase(newState, acted)) {
        actedThisStreetRef.current = new Set();
        setAnimatingPhase(true);
        setTimeout(() => {
          const advanced = advancePhase(newState);
          setGameState(advanced);
          setAnimatingPhase(false);
          if (advanced.roundOver || advanced.phase === "showdown") {
            setShowResult(true);
          }
          // useEffect will trigger NPC if needed after render
        }, 600);
      } else {
        // 3. Not complete, let next player act
        setGameState(newState);
        // useEffect will trigger NPC if it's still their turn (shouldn't be)
      }
    }, 800 + Math.random() * 700);

    npcTimerRef.current = timer;
  }, [settings.difficulty, shouldAdvancePhase]);

  // Auto-trigger NPC turn when it becomes their turn
  useEffect(() => {
    if (!gameState || animatingPhase || gameState.roundOver) return;
    if (gameState.phase === "showdown" || gameState.phase === "idle") return;
    if (gameState.currentPlayerIndex !== 1) return;
    if (npcTimerRef.current) return;

    processNPCTurn(gameState);
  }, [gameState, animatingPhase, processNPCTurn]);

  const handleAction = (action: PlayerAction, amount?: number) => {
    if (!gameState || !canAct) return;

    const actingIndex = gameState.currentPlayerIndex;
    const prevHighest = Math.max(...gameState.players.map(p => p.currentBet));
    const newState = handlePlayerAction(gameState, action, amount);

    // Update acted tracking
    const acted = actedThisStreetRef.current;
    const actingPlayer = newState.players[actingIndex];
    const isRaise = action === "raise" ||
      (action === "all-in" && actingPlayer.currentBet > prevHighest);
    if (isRaise) {
      acted.clear();
    }
    acted.add(actingIndex);

    // 1. Check if round ended (fold or engine detected end)
    if (newState.roundOver) {
      setGameState(newState);
      setShowResult(true);
      return;
    }

    // 2. Check if betting round is complete → advance phase
    if (shouldAdvancePhase(newState, acted)) {
      actedThisStreetRef.current = new Set();
      setAnimatingPhase(true);
      setTimeout(() => {
        const advanced = advancePhase(newState);
        setGameState(advanced);
        setAnimatingPhase(false);
        if (advanced.roundOver || advanced.phase === "showdown") {
          setShowResult(true);
        }
        // useEffect will trigger NPC if needed after render
      }, 600);
    } else {
      // 3. Not complete, let next player act
      setGameState(newState);
      // useEffect will trigger NPC if it's their turn
    }
  };

  const handleNewRound = () => {
    if (!gameState) return;
    setShowResult(false);
    actedThisStreetRef.current = new Set();
    const newState = startNewRound(gameState);
    setGameState(newState);
    // useEffect will trigger NPC if it's their turn
  };

  if (!gameState || !player || !npc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-felt-dark">
        <div className="text-[#d4af37] font-playfair text-2xl animate-pulse">
          Shuffling deck...
        </div>
      </div>
    );
  }

  const phaseLabel = {
    idle: "Waiting",
    preflop: "Pre-Flop",
    flop: "Flop",
    turn: "Turn",
    river: "River",
    showdown: "Showdown",
  }[gameState.phase];

  return (
    <main className="relative min-h-screen flex flex-col bg-felt-dark overflow-hidden select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-[#d4af37]/10 z-20">
        <Link href="/">
          <button className="text-[#d4af37]/60 hover:text-[#d4af37] transition-colors text-sm">
            ← Menu
          </button>
        </Link>
        <div className="text-[#d4af37]/60 text-sm font-playfair">{phaseLabel}</div>
        <div className="text-[#d4af37]/60 text-sm">
          Blinds: {gameState.smallBlind}/{gameState.bigBlind}
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 flex flex-col items-center justify-between py-4 px-4 relative">
        {/* Table felt */}
        <div className="absolute inset-x-4 inset-y-16 rounded-[40px] bg-felt border-4 border-[#d4af37]/20 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />

        {/* NPC area */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-3">
            <NPCAvatar size={48} />
            <div>
              <p className="text-white font-medium text-sm">{npc.name}</p>
              <ChipStack amount={npc.chips} size="sm" />
            </div>
            {npc.isDealer && (
              <span className="bg-[#d4af37] text-[#0a1f0a] text-[10px] font-bold px-2 py-0.5 rounded-full">D</span>
            )}
            {gameState.currentPlayerIndex === 1 && !gameState.roundOver && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[#d4af37] text-xs"
              >
                Thinking...
              </motion.div>
            )}
          </div>

          {/* NPC cards */}
          <div className="flex gap-2 mt-1">
            {npc.hand.map((card, i) => (
              <AnimatedCard
                key={`npc-${i}`}
                card={card}
                faceUp={gameState.phase === "showdown" && !gameState.players.some(p => p.folded)}
                cardBackStyle={settings.cardBackStyle}
                width={70}
                height={98}
                delay={i * 0.15}
              />
            ))}
            {npc.hand.length === 0 && (
              <>
                <div className="w-[70px] h-[98px] rounded-lg border border-white/5 bg-white/5" />
                <div className="w-[70px] h-[98px] rounded-lg border border-white/5 bg-white/5" />
              </>
            )}
          </div>
          {npc.currentBet > 0 && (
            <div className="text-[#d4af37]/60 text-xs">Bet: {npc.currentBet}</div>
          )}
        </div>

        {/* Community cards + pot */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Pot */}
          <motion.div
            key={gameState.pot}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="bg-black/40 px-4 py-1.5 rounded-full border border-[#d4af37]/20"
          >
            <span className="text-[#d4af37] font-bold text-lg">
              Pot: {gameState.pot}
            </span>
          </motion.div>

          {/* Community cards */}
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => {
              const card = gameState.communityCards[i];
              if (card) {
                return (
                  <AnimatedCard
                    key={`comm-${i}`}
                    card={card}
                    faceUp={true}
                    cardBackStyle={settings.cardBackStyle}
                    width={65}
                    height={91}
                    delay={i * 0.12}
                  />
                );
              }
              return (
                <div
                  key={`comm-empty-${i}`}
                  className="w-[65px] h-[91px] rounded-lg border border-[#d4af37]/10 bg-black/10"
                />
              );
            })}
          </div>
        </div>

        {/* Player area */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          {player.currentBet > 0 && (
            <div className="text-[#d4af37]/60 text-xs">Bet: {player.currentBet}</div>
          )}

          {/* Player cards */}
          <div className="flex gap-2">
            {player.hand.map((card, i) => (
              <AnimatedCard
                key={`player-${i}`}
                card={card}
                faceUp={true}
                cardBackStyle={settings.cardBackStyle}
                width={80}
                height={112}
                delay={i * 0.15 + 0.3}
              />
            ))}
            {player.hand.length === 0 && (
              <>
                <div className="w-[80px] h-[112px] rounded-lg border border-white/5 bg-white/5" />
                <div className="w-[80px] h-[112px] rounded-lg border border-white/5 bg-white/5" />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-white font-medium text-sm text-center">{player.name}</p>
              <ChipStack amount={player.chips} size="sm" />
            </div>
            {player.isDealer && (
              <span className="bg-[#d4af37] text-[#0a1f0a] text-[10px] font-bold px-2 py-0.5 rounded-full">D</span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="relative z-20 px-4 py-3 bg-black/40 border-t border-[#d4af37]/10">
        {showResult ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-[#d4af37] font-playfair text-xl font-bold">
                {gameState.winner === player.name ? "You Win!" : `${gameState.winner} Wins!`}
              </p>
              {gameState.winnerHand && (
                <p className="text-white/60 text-sm mt-1">{gameState.winnerHand}</p>
              )}
            </motion.div>
            {player.chips > 0 && npc.chips > 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewRound}
                className="px-8 py-2.5 rounded-xl font-playfair text-lg font-bold text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] to-[#d4af37] glow-gold transition-all"
              >
                Next Hand
              </motion.button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-white/60 text-sm">
                  {player.chips <= 0 ? "You're out of chips!" : "You cleaned them out!"}
                </p>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-2.5 rounded-xl font-playfair text-lg font-bold text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all"
                  >
                    Back to Menu
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Raise slider */}
            {canAct && (
              <div className="flex items-center gap-3 w-full max-w-sm">
                <span className="text-white/40 text-xs">{minRaise}</span>
                <input
                  type="range"
                  min={minRaise}
                  max={maxRaise}
                  step={5}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="flex-1 accent-[#d4af37] h-1.5"
                />
                <span className="text-[#d4af37] text-sm font-bold w-12 text-right">
                  {raiseAmount}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: canAct ? 1.05 : 1 }}
                whileTap={{ scale: canAct ? 0.95 : 1 }}
                onClick={() => handleAction("fold")}
                disabled={!canAct}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canAct
                    ? "bg-red-900/60 text-red-300 border border-red-700/40 hover:bg-red-900/80"
                    : "bg-white/5 text-white/20 border border-white/5"
                }`}
              >
                Fold
              </motion.button>

              <motion.button
                whileHover={{ scale: canAct ? 1.05 : 1 }}
                whileTap={{ scale: canAct ? 0.95 : 1 }}
                onClick={() => handleAction(callAmount > 0 ? "call" : "check")}
                disabled={!canAct}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canAct
                    ? "bg-[#1a472a] text-green-300 border border-green-700/40 hover:bg-[#1a572a]"
                    : "bg-white/5 text-white/20 border border-white/5"
                }`}
              >
                {callAmount > 0 ? `Call ${callAmount}` : "Check"}
              </motion.button>

              <motion.button
                whileHover={{ scale: canAct ? 1.05 : 1 }}
                whileTap={{ scale: canAct ? 0.95 : 1 }}
                onClick={() => handleAction("raise", raiseAmount)}
                disabled={!canAct}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canAct
                    ? "bg-gradient-to-b from-[#f0d060] to-[#d4af37] text-[#0a1f0a] glow-gold hover:brightness-110"
                    : "bg-white/5 text-white/20 border border-white/5"
                }`}
              >
                Raise {raiseAmount}
              </motion.button>
            </div>

            {!canAct && !animatingPhase && (
              <p className="text-white/30 text-xs">
                {gameState.phase === "idle" ? "Starting..." : "Waiting for opponent..."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Win celebration particles */}
      <AnimatePresence>
        {showResult && gameState.winner === player.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-30"
          >
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.3,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ["#d4af37", "#f0d060", "#fff", "#ff6b6b"][i % 4],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
