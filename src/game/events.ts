import type { GameEventType, GameEvent, ExtendedGameState } from './types';

/**
 * Creates a new game event with the current timestamp.
 */
export function createEvent(
  type: GameEventType,
  payload: Record<string, unknown> = {}
): GameEvent {
  return { type, timestamp: Date.now(), payload };
}

/**
 * Appends an event to the state's event queue (immutable).
 */
export function emitEvent(
  state: ExtendedGameState,
  type: GameEventType,
  payload: Record<string, unknown> = {}
): ExtendedGameState {
  return {
    ...state,
    events: [...state.events, createEvent(type, payload)],
  };
}

/**
 * Clears all events from the state (call after the UI has consumed them).
 */
export function clearEvents(
  state: ExtendedGameState
): ExtendedGameState {
  return { ...state, events: [] };
}
