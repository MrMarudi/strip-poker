/**
 * Strip Poker VIP — Luxury Casino Design Tokens
 *
 * Canonical design token values for use in TypeScript components.
 * These mirror the CSS custom properties defined in globals.css.
 */

export const TOKENS = {
  colors: {
    void: '#07060a',
    feltDark: '#0a1f0a',
    felt: '#1a472a',
    velvet: '#1a0a2e',
    gold: '#d4af37',
    goldLight: '#f0d060',
    goldDark: '#b8941e',
    cream: '#f0e8d0',
    ruby: '#c41e3a',
    emerald: '#2d6a4f',
    cardWhite: '#fafaf8',
    cardStroke: '#2a2a3a',
    cardBack: '#8b0000',
    darkAccent: '#1a1a2e',
  },

  shadows: {
    card: '0 4px 12px rgba(0,0,0,0.4)',
    goldGlow: '0 0 20px rgba(212,175,55,0.3)',
    goldRim: '0 0 8px rgba(212,175,55,0.5), inset 0 0 4px rgba(212,175,55,0.2)',
    chip: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
  },

  gradients: {
    goldShimmer: 'linear-gradient(135deg, #b8941e, #d4af37, #f0d060, #d4af37, #b8941e)',
    velvetDepth: 'linear-gradient(180deg, #1a0a2e, #0d0518)',
    felt: 'radial-gradient(ellipse at center, #1a472a, #0a1f0a)',
    goldText: 'linear-gradient(135deg, #d4af37, #f0d060)',
  },

  typography: {
    fontDisplay: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', system-ui, -apple-system, sans-serif",
  },

  timing: {
    chip: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    card: '500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    flip: '600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    celebration: '800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    dialogue: '400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
  },

  radius: {
    card: '8px',
    chip: '50%',
    button: '12px',
    panel: '16px',
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
  },
} as const;

/** Helper: get a CSS variable reference string */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

export type TokenColors = typeof TOKENS.colors;
export type TokenShadows = typeof TOKENS.shadows;
export type TokenGradients = typeof TOKENS.gradients;
export type TokenTiming = typeof TOKENS.timing;
export type TokenRadius = typeof TOKENS.radius;
export type TokenSpacing = typeof TOKENS.spacing;
