'use client';

import { useState, useCallback, useRef } from 'react';
import { TIMING } from './specs';

export type CharacterReaction = 'win' | 'lose' | 'bluff' | 'allIn' | null;

export interface CharacterAnimationState {
  // Dialogue
  currentDialogue: string | null;
  // Reaction
  currentReaction: CharacterReaction;
  // Thinking
  isThinking: boolean;
  // Layer transition
  isTransitioning: boolean;
  previousLayer: number;
  currentLayer: number;
  // Entrance
  hasEntered: boolean;
}

const INITIAL_STATE: CharacterAnimationState = {
  currentDialogue: null,
  currentReaction: null,
  isThinking: false,
  isTransitioning: false,
  previousLayer: 1,
  currentLayer: 1,
  hasEntered: false,
};

export function useCharacterAnimations() {
  const [state, setState] = useState<CharacterAnimationState>(INITIAL_STATE);
  const dialogueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show dialogue bubble (auto-dismisses after 3s)
  const showDialogue = useCallback((text: string) => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    setState(s => ({ ...s, currentDialogue: text }));
    dialogueTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, currentDialogue: null }));
    }, TIMING.dialogue.display * 1000);
  }, []);

  // Dismiss dialogue immediately
  const dismissDialogue = useCallback(() => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    setState(s => ({ ...s, currentDialogue: null }));
  }, []);

  // Trigger reaction (auto-clears after 1s)
  const triggerReaction = useCallback((reaction: CharacterReaction) => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    setState(s => ({ ...s, currentReaction: reaction }));
    reactionTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, currentReaction: null }));
    }, 1000);
  }, []);

  // Start thinking animation
  const startThinking = useCallback(() => {
    setState(s => ({ ...s, isThinking: true }));
  }, []);

  // Stop thinking animation
  const stopThinking = useCallback(() => {
    setState(s => ({ ...s, isThinking: false }));
  }, []);

  // Trigger clothing layer transition (with 0.5s dramatic pause)
  const transitionLayer = useCallback(async (newLayer: number) => {
    // Dramatic pause before strip
    await new Promise(r => setTimeout(r, 500));

    setState(s => ({
      ...s,
      isTransitioning: true,
      previousLayer: s.currentLayer,
      currentLayer: newLayer,
    }));

    // Wait for crossfade to complete
    await new Promise(r => setTimeout(r, TIMING.character.layerTransition * 1000));

    setState(s => ({ ...s, isTransitioning: false }));
  }, []);

  // Character entrance animation (from select screen to game)
  const triggerEntrance = useCallback(async () => {
    setState(s => ({ ...s, hasEntered: false }));
    // Small delay then trigger
    await new Promise(r => setTimeout(r, 100));
    setState(s => ({ ...s, hasEntered: true }));
  }, []);

  // Combined: show dialogue + reaction together
  const showReactionWithDialogue = useCallback((
    reaction: CharacterReaction,
    dialogue: string | null,
  ) => {
    if (reaction) triggerReaction(reaction);
    if (dialogue) showDialogue(dialogue);
  }, [triggerReaction, showDialogue]);

  // Reset all character animation state
  const reset = useCallback(() => {
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    setState(INITIAL_STATE);
  }, []);

  return {
    characterState: state,
    showDialogue,
    dismissDialogue,
    triggerReaction,
    startThinking,
    stopThinking,
    transitionLayer,
    triggerEntrance,
    showReactionWithDialogue,
    reset,
  };
}
