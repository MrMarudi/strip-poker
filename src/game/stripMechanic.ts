'use strict';

import type { Character } from './types';

export const TOTAL_LAYERS = 6;

/**
 * Returns the current clothing layer for a character.
 * Layer 1 = fully clothed, layer 6 = final.
 */
export function getCurrentLayer(character: Character): number {
  return character.currentLayer;
}

/**
 * Returns true when the character has reached the final layer
 * (fully stripped / game over condition).
 */
export function isGameOver(character: Character): boolean {
  return character.currentLayer >= TOTAL_LAYERS;
}

/**
 * Returns the next layer number, clamped to TOTAL_LAYERS.
 */
export function getNextLayer(character: Character): number {
  return Math.min(character.currentLayer + 1, TOTAL_LAYERS);
}

/**
 * Builds the image path for a specific character layer.
 * Convention: /characters/{id}/layer{n}.jpg
 */
export function getLayerImagePath(characterId: string, layer: number): string {
  return `/characters/${characterId}/layer${layer}.jpg`;
}

/**
 * Determines whether a strip event should fire.
 * Strip only triggers when the NPC loses a hand.
 */
export function shouldStripTrigger(
  _winnerId: string,
  _loserId: string,
  isNPC: boolean
): boolean {
  return isNPC;
}

/**
 * Maps a layer number to a dialogue situation key so the
 * dialogue system can pick contextually appropriate lines.
 *
 *   layers 1-2  -> 'nervous'   (early, mild reaction)
 *   layers 3-4  -> 'lose'      (mid-game frustration/embarrassment)
 *   layers 5-6  -> 'nervous'   (final layers, heightened tension)
 */
export function getStripDialogueSituation(layer: number): string {
  if (layer <= 2) return 'nervous';
  if (layer <= 4) return 'lose';
  return 'nervous';
}
