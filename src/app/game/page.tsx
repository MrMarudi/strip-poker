'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ── Game engine ─────────────────────────────────────────────────────
import {
  createExtendedState,
  startNewRound,
  handlePlayerAction,
  advancePhase,
  isBettingRoundComplete,
  processStripTrigger,
  checkGameOver,
} from '@/game/engine';
import { getNPCAction } from '@/game/npc';
import { getDialogue } from '@/game/dialogue';
import { getStripDialogueSituation } from '@/game/stripMechanic';
import type {
  ExtendedGameState,
  PlayerAction,
  Personality,
} from '@/game/types';

// ── Store & context ─────────────────────────────────────────────────
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/context/SettingsContext';

// ── Animation hooks ─────────────────────────────────────────────────
import { useChipAnimations } from '@/animations/chipAnimations';
import { useCardAnimations } from '@/animations/cardAnimations';
import { useCharacterAnimations } from '@/animations/characterAnimations';
import { useCelebrations } from '@/animations/celebrations';

// ── UI components ───────────────────────────────────────────────────
import { PlayerHand, CommunityCards } from '@/components/cards';
import { ChipStack, PotDisplay, BetDisplay, FlyingChipLayer } from '@/components/chips';
import {
  CharacterPortrait,
  CharacterInfo,
  DialogueBubble,
  ThinkingOverlay,
} from '@/components/character';
import { GameStatusBar, PhaseIndicator, ActionBar } from '@/components/hud';
import { CelebrationLayer } from '@/components/effects';

// ── Character data ──────────────────────────────────────────────────
import charactersJson from '@/data/characters.json';

// ── Types ───────────────────────────────────────────────────────────
interface CharacterData {
  id: string;
  displayName: string;
  personality: Personality;
  description: string;
  heroImage: string;
  layers: string[];
  difficulty: string;
  unlocked: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const randomDelay = (min: number, max: number) =>
  min + Math.random() * (max - min);

// =====================================================================
// GAME PAGE
// =====================================================================

export default function GamePage() {
  const router = useRouter();
  const { settings } = useSettings();

  // ── Zustand store ───────────────────────────────────────────────
  const {
    selectedCharacterId,
    difficulty: storeDifficulty,
    advanceLayer,
    recordHandResult,
    updateChips,
    setRoundNumber,
    setGameOver: storeSetGameOver,
    resetGame,
    getCurrentLayer,
  } = useGameStore();

  // ── Resolve character ───────────────────────────────────────────
  const characterData: CharacterData | null = useMemo(() => {
    if (!selectedCharacterId) return null;
    return (
      (charactersJson.characters as CharacterData[]).find(
        (c) => c.id === selectedCharacterId,
      ) ?? null
    );
  }, [selectedCharacterId]);

  // ── Game state (engine) ─────────────────────────────────────────
  const [gameState, setGameState] = useState<ExtendedGameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const npcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const actedThisStreetRef = useRef<Set<number>>(new Set());

  // ── Animation hooks ─────────────────────────────────────────────
  const {
    flyingChips,
    tossChipsToPot,
    collectPot,
    postBlinds,
    cancelAnimations: cancelChipAnimations,
  } = useChipAnimations();

  const {
    cardState,
    dealHoleCards,
    revealCommunityCards,
    revealOpponentCards,
    highlightWinningHand,
    cleanupCards,
    cancelAnimations: cancelCardAnimations,
  } = useCardAnimations();

  const {
    characterState,
    showDialogue,
    dismissDialogue,
    startThinking,
    stopThinking,
    transitionLayer,
    triggerEntrance,
    showReactionWithDialogue,
    reset: resetCharacterAnimations,
  } = useCharacterAnimations();

  const {
    intensity: celebrationIntensity,
    handRank: celebrationHandRank,
    celebrate,
    cancel: cancelCelebration,
  } = useCelebrations();

  // Derived difficulty: prefer settings context, fall back to store
  const difficulty = settings.difficulty ?? storeDifficulty;

  // ── Redirect if no character selected ───────────────────────────
  useEffect(() => {
    if (!selectedCharacterId) {
      router.replace('/select');
    }
  }, [selectedCharacterId, router]);

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
      cancelChipAnimations();
      cancelCardAnimations();
      cancelCelebration();
    };
  }, [cancelChipAnimations, cancelCardAnimations, cancelCelebration]);

  // ── Initialize game on mount ────────────────────────────────────
  useEffect(() => {
    if (!characterData || gameState) return;

    const personality = characterData.personality as Personality;
    const initial = createExtendedState(
      settings.playerName,
      characterData.id,
      characterData.displayName,
      personality,
      difficulty,
    );

    // Restore persisted layer from store
    const savedLayer = getCurrentLayer(characterData.id);
    if (savedLayer > 1) {
      initial.character.currentLayer = savedLayer;
    }

    setGameState(initial);
    resetGame();
    triggerEntrance();
    // Start first round after a brief intro
    setTimeout(() => {
      if (!mountedRef.current) return;
      beginNewRound(initial);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterData]);

  // ── Derived values ──────────────────────────────────────────────
  const player = gameState?.players[0] ?? null;
  const npc = gameState?.players[1] ?? null;
  const isPlayerTurn =
    gameState != null &&
    gameState.currentPlayerIndex === 0 &&
    !gameState.roundOver &&
    gameState.phase !== 'idle' &&
    gameState.phase !== 'showdown';

  const canAct = isPlayerTurn && !isProcessing;

  const callAmount = useMemo(() => {
    if (!gameState || !player) return 0;
    const highest = Math.max(...gameState.players.map((p) => p.currentBet));
    return Math.max(0, highest - player.currentBet);
  }, [gameState, player]);

  const canCheck = callAmount === 0;
  const minRaise = gameState?.bigBlind ?? 10;
  const maxRaise = player?.chips ?? 100;

  // ================================================================
  // GAME FLOW FUNCTIONS
  // ================================================================

  /** Start a new round with full animation sequence. */
  const beginNewRound = useCallback(
    async (state: ExtendedGameState) => {
      if (!mountedRef.current) return;
      setIsProcessing(true);
      setShowResult(false);
      setResultMessage(null);
      actedThisStreetRef.current = new Set();

      // 1. Start round in engine
      const newRound = startNewRound(state) as ExtendedGameState;
      setGameState(newRound);

      // Sync store
      setRoundNumber(newRound.roundNumber);
      updateChips(newRound.players[0].chips, newRound.players[1].chips);

      // 2. Post blinds animation
      await postBlinds('#player-chip-area');
      if (!mountedRef.current) return;
      await wait(200);
      await postBlinds('#opponent-chip-area');
      if (!mountedRef.current) return;

      // 3. Deal hole cards animation
      await dealHoleCards();
      if (!mountedRef.current) return;

      setIsProcessing(false);

      // 4. If NPC acts first, trigger their turn
      if (newRound.currentPlayerIndex === 1) {
        scheduleNPCTurn(newRound);
      }
    },
    [postBlinds, dealHoleCards, setRoundNumber, updateChips],
  );

  /** Check if betting round is done and advance if so. */
  const checkAndAdvancePhase = useCallback(
    async (state: ExtendedGameState, acted: Set<number>): Promise<ExtendedGameState> => {
      // All non-folded players with chips must have acted and bets must be equal
      const nonFolded = state.players.filter((p) => !p.folded);
      const highestBet = Math.max(...nonFolded.map((p) => p.currentBet));
      const allActed = state.players
        .map((p, i) => ({ player: p, index: i }))
        .filter(({ player: p }) => !p.folded && p.chips > 0)
        .every(({ index, player: p }) => acted.has(index) && p.currentBet >= highestBet);

      if (!allActed) return state;

      // Advance phase
      setIsProcessing(true);
      actedThisStreetRef.current = new Set();
      await wait(500); // inter-phase delay

      const advanced = advancePhase(state) as ExtendedGameState;
      setGameState(advanced);

      // Animate community cards
      if (advanced.phase === 'flop' && advanced.communityCards.length >= 3) {
        await revealCommunityCards(3);
      } else if (advanced.phase === 'turn' && advanced.communityCards.length >= 4) {
        await revealCommunityCards(4);
      } else if (advanced.phase === 'river' && advanced.communityCards.length >= 5) {
        await revealCommunityCards(5);
      }

      if (!mountedRef.current) return advanced;

      // Check for showdown
      if (advanced.roundOver || advanced.phase === 'showdown') {
        await handleShowdown(advanced);
        return advanced;
      }

      setIsProcessing(false);
      return advanced;
    },
    [revealCommunityCards],
  );

  /** Handle the showdown sequence. */
  const handleShowdown = useCallback(
    async (state: ExtendedGameState) => {
      if (!mountedRef.current) return;
      setIsProcessing(true);

      const playerWon = state.winner === state.players[0].name;
      const npcWon = state.winner === state.players[1].name;

      // 1. Reveal opponent cards (if not a fold win)
      if (state.players.filter((p) => !p.folded).length > 1) {
        await revealOpponentCards();
        if (!mountedRef.current) return;
        await wait(600);
      }

      // 2. Highlight winning hand
      await highlightWinningHand(playerWon);
      if (!mountedRef.current) return;

      // 3. Collect pot animation
      const targetEl = playerWon ? '#player-chip-area' : '#opponent-chip-area';
      await collectPot(targetEl);
      if (!mountedRef.current) return;

      // 4. Celebration (player wins)
      if (playerWon) {
        const rank = state.winnerHand ?? '';
        const level =
          rank.includes('Royal Flush') || rank.includes('Straight Flush')
            ? 'jackpot'
            : rank.includes('Four of a Kind') || rank.includes('Full House')
              ? 'large'
              : rank.includes('Flush') || rank.includes('Straight') || rank.includes('Three of a Kind')
                ? 'medium'
                : 'small';
        celebrate(level as 'small' | 'medium' | 'large' | 'jackpot', rank);
      }

      // 5. NPC dialogue on win/loss
      const dialogueSituation = playerWon ? 'lose' : 'win';
      const dialogue = getDialogue(state.character.id, dialogueSituation);
      if (dialogue) {
        showReactionWithDialogue(playerWon ? 'lose' : 'win', dialogue);
      }

      // 6. Process strip trigger (NPC lost)
      let updatedState = state;
      if (playerWon) {
        updatedState = processStripTrigger(updatedState);

        if (updatedState.character.currentLayer > state.character.currentLayer) {
          // Layer advanced -- animate and persist
          await transitionLayer(updatedState.character.currentLayer);
          advanceLayer(updatedState.character.id);

          // Strip reaction dialogue
          const stripSituation = getStripDialogueSituation(
            updatedState.character.currentLayer,
          );
          const stripDialogue = getDialogue(
            updatedState.character.id,
            stripSituation as 'nervous' | 'lose',
          );
          if (stripDialogue) {
            showDialogue(stripDialogue);
          }
        }
      }

      // 7. Record result in store
      recordHandResult(updatedState.character.id, npcWon);
      updateChips(updatedState.players[0].chips, updatedState.players[1].chips);

      // 8. Check game over
      updatedState = checkGameOver(updatedState);
      setGameState(updatedState);

      if (updatedState.gameOver) {
        storeSetGameOver(updatedState.gameOverReason ?? 'unknown');
        setResultMessage(
          updatedState.gameOverReason === 'player_broke'
            ? 'You ran out of chips!'
            : updatedState.gameOverReason === 'opponent_broke'
              ? `${updatedState.character.displayName} ran out of chips!`
              : updatedState.gameOverReason === 'opponent_stripped'
                ? `${updatedState.character.displayName} has nothing left to wager!`
                : 'Game Over',
        );
      }

      setShowResult(true);
      setIsProcessing(false);
    },
    [
      revealOpponentCards,
      highlightWinningHand,
      collectPot,
      celebrate,
      showReactionWithDialogue,
      showDialogue,
      transitionLayer,
      advanceLayer,
      recordHandResult,
      updateChips,
      storeSetGameOver,
    ],
  );

  /** Schedule the NPC's turn with a thinking delay. */
  const scheduleNPCTurn = useCallback(
    (state: ExtendedGameState) => {
      if (
        state.roundOver ||
        state.phase === 'showdown' ||
        state.phase === 'idle' ||
        state.currentPlayerIndex !== 1
      ) {
        return;
      }

      startThinking();
      const delay = randomDelay(800, 1500);

      npcTimerRef.current = setTimeout(async () => {
        npcTimerRef.current = null;
        if (!mountedRef.current) return;

        stopThinking();

        // Get NPC decision
        const { action, amount, dialogue } = getNPCAction(
          state,
          1,
          difficulty,
          state.character.id,
        );

        // Show dialogue if any
        if (dialogue) {
          showDialogue(dialogue);
        }

        // Execute action
        const prevHighest = Math.max(
          ...state.players.map((p) => p.currentBet),
        );
        const newState = handlePlayerAction(
          state,
          action,
          amount,
        ) as ExtendedGameState;

        // Chip animation for NPC bet
        const betAmount = action === 'fold' || action === 'check' ? 0 : amount;
        if (betAmount > 0) {
          await tossChipsToPot(betAmount, '#opponent-chip-area');
        }

        if (!mountedRef.current) return;

        // Track acted
        const acted = actedThisStreetRef.current;
        const actingPlayer = newState.players[1];
        const isRaise =
          action === 'raise' ||
          (action === 'all-in' && actingPlayer.currentBet > prevHighest);
        if (isRaise) {
          acted.clear();
        }
        acted.add(1);

        // Round ended by fold?
        if (newState.roundOver) {
          setGameState(newState);
          await handleShowdown(newState);
          return;
        }

        setGameState(newState);
        updateChips(newState.players[0].chips, newState.players[1].chips);

        // Check phase advancement
        const afterPhase = await checkAndAdvancePhase(newState, acted);

        // If still NPC's turn after phase advance (shouldn't be in heads-up, but safety)
        if (
          !afterPhase.roundOver &&
          afterPhase.phase !== 'showdown' &&
          afterPhase.currentPlayerIndex === 1
        ) {
          scheduleNPCTurn(afterPhase);
        }
      }, delay);
    },
    [
      difficulty,
      startThinking,
      stopThinking,
      showDialogue,
      tossChipsToPot,
      handleShowdown,
      checkAndAdvancePhase,
      updateChips,
    ],
  );

  // ── Auto-trigger NPC turn ───────────────────────────────────────
  useEffect(() => {
    if (
      !gameState ||
      isProcessing ||
      gameState.roundOver ||
      gameState.phase === 'showdown' ||
      gameState.phase === 'idle' ||
      gameState.currentPlayerIndex !== 1 ||
      npcTimerRef.current
    ) {
      return;
    }
    scheduleNPCTurn(gameState);
  }, [gameState, isProcessing, scheduleNPCTurn]);

  // ================================================================
  // PLAYER ACTION HANDLER
  // ================================================================

  const handleAction = useCallback(
    async (action: PlayerAction, raiseAmount?: number) => {
      if (!gameState || !canAct) return;
      setIsProcessing(true);

      const prevHighest = Math.max(
        ...gameState.players.map((p) => p.currentBet),
      );
      const newState = handlePlayerAction(
        gameState,
        action,
        raiseAmount,
      ) as ExtendedGameState;

      // Chip animation for player bet
      const betAmount =
        action === 'fold' || action === 'check' ? 0 : (raiseAmount ?? 0);
      if (betAmount > 0) {
        await tossChipsToPot(betAmount, '#player-chip-area');
      }

      if (!mountedRef.current) return;

      // Track acted
      const acted = actedThisStreetRef.current;
      const actingPlayer = newState.players[0];
      const isRaise =
        action === 'raise' ||
        (action === 'all-in' && actingPlayer.currentBet > prevHighest);
      if (isRaise) {
        acted.clear();
      }
      acted.add(0);

      // Round ended by fold?
      if (newState.roundOver) {
        setGameState(newState);
        await handleShowdown(newState);
        return;
      }

      setGameState(newState);
      updateChips(newState.players[0].chips, newState.players[1].chips);

      // Check phase advancement
      const afterPhase = await checkAndAdvancePhase(newState, acted);

      if (
        !afterPhase.roundOver &&
        afterPhase.phase !== 'showdown'
      ) {
        setIsProcessing(false);
        // NPC turn will be triggered by useEffect
      }
    },
    [
      gameState,
      canAct,
      tossChipsToPot,
      handleShowdown,
      checkAndAdvancePhase,
      updateChips,
    ],
  );

  // ── Next hand handler ───────────────────────────────────────────
  const handleNextHand = useCallback(async () => {
    if (!gameState) return;
    setIsProcessing(true);
    dismissDialogue();

    // Cleanup card animations
    await cleanupCards();
    if (!mountedRef.current) return;

    beginNewRound(gameState);
  }, [gameState, cleanupCards, dismissDialogue, beginNewRound]);

  // ── Back to menu handler ────────────────────────────────────────
  const handleBackToMenu = useCallback(() => {
    resetGame();
    router.push('/');
  }, [resetGame, router]);

  // ================================================================
  // LOADING / REDIRECT STATES
  // ================================================================

  if (!selectedCharacterId || !characterData) {
    return (
      <main className="h-dvh flex items-center justify-center bg-[#07060a] overflow-hidden">
        <div className="text-[#d4af37] font-playfair text-2xl animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  if (!gameState || !player || !npc) {
    return (
      <main className="h-dvh flex items-center justify-center bg-[#07060a] overflow-hidden">
        <div className="text-[#d4af37] font-playfair text-2xl animate-pulse">
          Shuffling deck...
        </div>
      </main>
    );
  }

  // ================================================================
  // RENDER
  // ================================================================

  const currentLayer = gameState.character.currentLayer;
  const isGameOver = gameState.gameOver;
  const playerCanContinue =
    !isGameOver && player.chips > 0 && npc.chips > 0;

  return (
    <main className="relative h-dvh flex flex-col bg-[#07060a] overflow-hidden select-none">
      {/* ─── 1. STATUS BAR ────────────────────────────────────── */}
      <div className="shrink-0">
        <GameStatusBar
          roundNumber={gameState.roundNumber}
          handsWon={gameState.character.handsWon}
          handsLost={gameState.character.handsLost}
          blinds={{ small: gameState.smallBlind, big: gameState.bigBlind }}
        />
      </div>

      {/* ─── MAIN TABLE AREA ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between py-0.5 sm:py-1 px-1.5 sm:px-4 relative min-h-0">
        {/* Table felt background */}
        <div className="absolute inset-x-1 sm:inset-x-4 inset-y-1 sm:inset-y-6 rounded-[16px] sm:rounded-[40px] bg-gradient-to-b from-[#1a472a] to-[#0e2d1a] border sm:border-4 border-[#d4af37]/15 shadow-[inset_0_0_60px_rgba(0,0,0,0.4),inset_0_0_120px_rgba(0,0,0,0.2)]" />

        {/* ─── 2. OPPONENT AREA ────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-0 sm:gap-1 w-full shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Portrait with thinking overlay */}
            <div className="relative" style={{ flexShrink: 0 }}>
              <CharacterPortrait
                characterId={characterData.id}
                currentLayer={currentLayer}
                size="xs"
              />
              <ThinkingOverlay isThinking={characterState.isThinking} />
            </div>

            {/* Info + dialogue */}
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <CharacterInfo
                characterId={characterData.id}
                displayName={characterData.displayName}
                chips={npc.chips}
                handsWon={gameState.character.handsWon}
                isThinking={characterState.isThinking}
                isDealer={npc.isDealer}
                compact
              />
              <DialogueBubble
                text={characterState.currentDialogue}
                characterName={characterData.displayName}
                onDismiss={dismissDialogue}
              />
            </div>
          </div>

          {/* Opponent cards (face down, revealed at showdown) */}
          <div className="relative mt-0.5">
            {npc.hand.length > 0 && (
              <PlayerHand
                cards={npc.hand}
                faceUp={cardState.opponentCardsFaceUp}
                highlighted={cardState.highlightOpponentHand}
                cardWidth={36}
                cardHeight={50}
              />
            )}
            {npc.hand.length === 0 && cardState.opponentCardsVisible && (
              <div className="flex gap-1">
                <div className="w-[36px] h-[50px] sm:w-[60px] sm:h-[84px] rounded border border-white/5 bg-white/5" />
                <div className="w-[36px] h-[50px] sm:w-[60px] sm:h-[84px] rounded border border-white/5 bg-white/5" />
              </div>
            )}
          </div>

          {/* Opponent bet display */}
          <div className="relative h-2 sm:h-5" id="opponent-bet-area">
            <BetDisplay amount={npc.currentBet} position="opponent" />
          </div>

          {/* Opponent chip area (for animations) */}
          <div id="opponent-chip-area" className="h-0 w-0" />
        </div>

        {/* ─── 3. TABLE CENTER ─────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1 flex-1 min-h-0 justify-center">
          {/* Pot */}
          <PotDisplay amount={gameState.pot} compact />

          {/* Community cards */}
          <CommunityCards
            cards={gameState.communityCards}
            revealedCount={cardState.revealedCommunityCount}
            highlightIndices={cardState.highlightedCardIndices}
            cardWidth={38}
            cardHeight={53}
            gap={2}
          />

          {/* Phase indicator */}
          <PhaseIndicator currentPhase={gameState.phase} />
        </div>

        {/* ─── 4. PLAYER AREA ──────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-0 sm:gap-1 w-full shrink-0">
          {/* Player bet display */}
          <div className="relative h-2 sm:h-5" id="player-bet-area">
            <BetDisplay amount={player.currentBet} position="player" />
          </div>

          {/* Player cards (always face up) */}
          <div className="relative">
            {player.hand.length > 0 && (
              <PlayerHand
                cards={player.hand}
                faceUp={cardState.playerCardsFaceUp}
                highlighted={cardState.highlightPlayerHand}
                cardWidth={44}
                cardHeight={62}
              />
            )}
            {player.hand.length === 0 && cardState.playerCardsVisible && (
              <div className="flex gap-1">
                <div className="w-[44px] h-[62px] sm:w-[72px] sm:h-[100px] rounded border border-white/5 bg-white/5" />
                <div className="w-[44px] h-[62px] sm:w-[72px] sm:h-[100px] rounded border border-white/5 bg-white/5" />
              </div>
            )}
          </div>

          {/* Player info row */}
          <div className="flex items-center gap-2 mt-0.5" id="player-chip-area">
            <p className="text-white font-medium text-xs sm:text-sm">{player.name}</p>
            <span className="text-[#d4af37] font-bold text-xs sm:text-sm">${player.chips}</span>
            {player.isDealer && (
              <span className="bg-[#d4af37] text-[#0a1f0a] text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                D
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. ACTION BAR (fixed bottom) ──────────────────────── */}
      <div className="relative z-20 shrink-0 px-1.5 sm:px-4 pt-1 pb-2 sm:py-2 bg-[#07060a]/80 border-t border-[#d4af37]/10 backdrop-blur-sm safe-bottom">
        {showResult ? (
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            {/* Result message */}
            <div className="text-center">
              <p className="text-[#d4af37] font-playfair text-base sm:text-xl font-bold">
                {gameState.winner === player.name
                  ? 'You Win!'
                  : `${gameState.winner} Wins!`}
              </p>
              {gameState.winnerHand && (
                <p className="text-white/60 text-xs sm:text-sm">
                  {gameState.winnerHand}
                </p>
              )}
              {resultMessage && (
                <p className="text-white/40 text-[10px] sm:text-xs">{resultMessage}</p>
              )}
            </div>

            {/* Next hand or game over */}
            {playerCanContinue ? (
              <button
                onClick={handleNextHand}
                disabled={isProcessing}
                className="px-6 py-2 rounded-xl font-playfair text-base sm:text-lg font-bold text-[#0a1f0a] bg-gradient-to-b from-[#f0d060] to-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all disabled:opacity-50"
              >
                Next Hand
              </button>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-white/60 text-xs sm:text-sm">
                  {isGameOver
                    ? resultMessage ?? 'Game Over'
                    : player.chips <= 0
                      ? "You're out of chips!"
                      : 'You cleaned them out!'}
                </p>
                <button
                  onClick={handleBackToMenu}
                  className="px-6 py-2 rounded-xl font-playfair text-base sm:text-lg font-bold text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/5 transition-all"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        ) : (
          <ActionBar
            onAction={handleAction}
            disabled={!canAct}
            canCheck={canCheck}
            callAmount={callAmount}
            minRaise={minRaise}
            maxRaise={maxRaise}
            playerChips={player.chips}
          />
        )}
      </div>

      {/* ─── 6. OVERLAY LAYERS ─────────────────────────────────── */}
      <FlyingChipLayer chips={flyingChips} />
      <CelebrationLayer
        intensity={celebrationIntensity}
        handRank={celebrationHandRank ?? undefined}
      />
    </main>
  );
}
