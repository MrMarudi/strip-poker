/**
 * Strip Poker VIP — Animation Specifications
 *
 * All Framer Motion variants, timing constants, and easing curves for the
 * entire game. Values are derived from the design-token timing definitions
 * in `src/design/tokens.ts` and `src/app/globals.css`.
 *
 * Usage:
 *   import { cardVariants, TIMING, EASING } from '@/animations/specs';
 *   <motion.div variants={cardVariants.deal} initial="initial" animate="animate" />
 */

// ==========================================
// TIMING CONSTANTS
// ==========================================
export const TIMING = {
  chip: { duration: 0.3, stagger: 0.05 },
  card: { deal: 0.5, flip: 0.6, stagger: 0.15, reveal: 0.4 },
  celebration: { duration: 0.8, particle: 2.0, glow: 1.5 },
  dialogue: { enter: 0.4, exit: 0.3, display: 3.0 },
  character: { reaction: 0.3, layerTransition: 1.5, thinking: 0.8 },
  phase: { delay: 0.5 },
} as const;

// ==========================================
// EASING CURVES (cubic-bezier as arrays for Framer Motion)
// ==========================================
export const EASING = {
  /** Overshoot bounce — chip tosses & pot updates */
  chipBounce: [0.34, 1.56, 0.64, 1] as const,
  /** Smooth ease-out — card dealing & cleanup */
  cardSmooth: [0.25, 0.1, 0.25, 1] as const,
  /** Elastic overshoot — card flips */
  flipElastic: [0.175, 0.885, 0.32, 1.275] as const,
  /** Dramatic pop — celebrations & hand-rank reveals */
  celebrationPop: [0.68, -0.55, 0.265, 1.55] as const,
  /** Smooth slide — dialogue bubbles & UI panels */
  dialogueSlide: [0.25, 0.8, 0.25, 1] as const,

  /** Framer spring presets */
  spring: { type: "spring" as const, stiffness: 300, damping: 20 },
  springBouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
  springGentle: { type: "spring" as const, stiffness: 200, damping: 25 },
} as const;

// ==========================================
// CHIP ANIMATIONS
// ==========================================
export const chipVariants = {
  /** Chip toss: arc from player stack to pot */
  toss: {
    initial: { scale: 1, opacity: 1 },
    animate: (custom: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }) => ({
      x: [custom.fromX, (custom.fromX + custom.toX) / 2, custom.toX],
      y: [custom.fromY, custom.fromY - 80, custom.toY],
      scale: [1, 1.1, 0.95, 1],
      rotate: [0, 15, -5, 0],
      transition: {
        duration: TIMING.chip.duration,
        ease: EASING.chipBounce,
      },
    }),
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } },
  },

  /** Chip stack: spring-in when value changes */
  stack: {
    initial: { scale: 0, y: 10, opacity: 0 },
    animate: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 15 },
    },
    exit: { scale: 0.5, y: -10, opacity: 0, transition: { duration: 0.2 } },
  },

  /** Pot collection: chips slide from pot to winner */
  collect: {
    initial: { scale: 1, opacity: 1 },
    animate: (custom: { toX: number; toY: number }) => ({
      x: custom.toX,
      y: custom.toY,
      scale: [1, 1.05, 0.9],
      opacity: [1, 1, 0],
      transition: { duration: 0.5, ease: EASING.cardSmooth },
    }),
  },

  /** Blind posting: small slide to pot */
  blind: {
    initial: { x: 0, y: 0, opacity: 1 },
    animate: (custom: { toX: number; toY: number }) => ({
      x: custom.toX,
      y: custom.toY,
      scale: [1, 0.9],
      transition: { duration: 0.35, ease: EASING.chipBounce },
    }),
  },
};

// ==========================================
// CARD ANIMATIONS
// ==========================================
export const cardVariants = {
  /** Deal from deck to position */
  deal: {
    initial: { x: 0, y: -200, rotate: -15, scale: 0.5, opacity: 0 },
    animate: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: TIMING.card.deal,
        ease: EASING.cardSmooth,
      },
    },
    exit: { x: 100, opacity: 0, transition: { duration: 0.3 } },
  },

  /** 3D flip reveal (rotateY on a perspective-parent) */
  flip: {
    faceDown: {
      rotateY: 180,
      transition: {
        duration: TIMING.card.flip,
        ease: EASING.flipElastic,
      },
    },
    faceUp: {
      rotateY: 0,
      transition: {
        duration: TIMING.card.flip,
        ease: EASING.flipElastic,
      },
    },
  },

  /** Community card reveal (slide-in + flip combined) */
  communityReveal: {
    initial: { x: -50, y: -20, rotateY: 180, scale: 0.8, opacity: 0 },
    animate: {
      x: 0,
      y: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: TIMING.card.reveal + TIMING.card.flip,
        ease: EASING.flipElastic,
      },
    },
  },

  /** Winning hand gold glow highlight (pulsing) */
  winHighlight: {
    initial: { boxShadow: "0 0 0px rgba(212,175,55,0)" },
    animate: {
      boxShadow: [
        "0 0 0px rgba(212,175,55,0)",
        "0 0 20px rgba(212,175,55,0.8)",
        "0 0 10px rgba(212,175,55,0.4)",
      ],
      scale: [1, 1.05, 1.02],
      transition: { duration: 1.0, repeat: 2, ease: "easeInOut" },
    },
  },

  /** Card cleanup sweep between rounds */
  cleanup: {
    exit: {
      y: -300,
      rotate: 20,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.4, ease: EASING.cardSmooth },
    },
  },
};

// ==========================================
// CHARACTER ANIMATIONS
// ==========================================
export const characterVariants = {
  /** Dialogue bubble slide-in / slide-out */
  dialogue: {
    initial: { x: 30, opacity: 0, scale: 0.9 },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: TIMING.dialogue.enter,
        ease: EASING.dialogueSlide,
      },
    },
    exit: {
      x: -20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: TIMING.dialogue.exit },
    },
  },

  /** Portrait reaction pulses (keyed by emotion) */
  reaction: {
    win: {
      scale: [1, 1.05, 1.02, 1],
      transition: { duration: 0.5, ease: "easeOut" },
    },
    lose: {
      scale: [1, 0.98, 1],
      filter: ["brightness(1)", "brightness(0.7)", "brightness(0.85)"],
      transition: { duration: 0.6 },
    },
    bluff: {
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      transition: { duration: 0.4 },
    },
    allIn: {
      scale: [1, 1.08, 1.03, 1],
      transition: { duration: 0.6, ease: EASING.celebrationPop },
    },
  },

  /** Clothing layer crossfade */
  layerTransition: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: TIMING.character.layerTransition,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: TIMING.character.layerTransition * 0.5,
      },
    },
  },

  /** Thinking indicator (infinite bob) */
  thinking: {
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: TIMING.character.thinking,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  /** Character entrance (select screen to game) */
  entrance: {
    initial: { scale: 0.8, opacity: 0, y: 30 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASING.flipElastic },
    },
  },
};

// ==========================================
// CELEBRATION ANIMATIONS
// ==========================================
export const celebrationVariants = {
  /** Gold particle burst config (for tsParticles / custom emitter) */
  particleBurst: {
    count: 50,
    colors: ["#d4af37", "#f0d060", "#b8941e", "#ffffff"],
    spread: 360,
    speed: { min: 2, max: 8 },
    life: { min: 1, max: 3 },
    size: { min: 2, max: 6 },
  },

  /** Full-screen gold glow overlay flash */
  screenGlow: {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.15, 0.08, 0.12, 0],
      transition: { duration: 1.5, ease: "easeInOut" },
    },
  },

  /** Hand rank text pop-in */
  handRankReveal: {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: {
      scale: [0, 1.3, 1],
      opacity: [0, 1, 1],
      y: [20, -10, 0],
      transition: { duration: 0.8, ease: EASING.celebrationPop },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -30,
      transition: { duration: 0.4 },
    },
  },

  /** Chip rain (individual falling chip — use with stagger.chipRain) */
  chipRain: {
    initial: (custom: { x: number; delay: number }) => ({
      y: -50,
      x: custom.x,
      opacity: 0,
      rotate: 0,
    }),
    animate: (custom: { x: number; delay: number }) => ({
      y: typeof window !== "undefined" ? window.innerHeight : 800,
      x: custom.x + (Math.random() - 0.5) * 40,
      opacity: [0, 1, 1, 0],
      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
      transition: {
        duration: 2 + Math.random(),
        delay: custom.delay,
        ease: "easeIn",
      },
    }),
  },

  /** Table spotlight glow (radial gradient overlay) */
  tableSpotlight: {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0, 0.3, 0.15],
      scale: [0.5, 1.2, 1],
      transition: { duration: 1.2, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 1.5, transition: { duration: 0.8 } },
  },
};

// ==========================================
// UI ANIMATIONS
// ==========================================
export const uiVariants = {
  /** Page transition (fade + slide) */
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: EASING.dialogueSlide },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  },

  /** Button hover / press (use with whileHover / whileTap) */
  button: {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 15px rgba(212,175,55,0.4)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  },

  /** Action bar slide-up from bottom */
  actionBar: {
    initial: { y: 100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { y: 50, opacity: 0, transition: { duration: 0.2 } },
  },

  /** Pot amount counter bump */
  potCounter: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1],
      transition: { duration: 0.3, ease: EASING.chipBounce },
    },
  },

  /** Phase indicator dot states */
  phaseIndicator: {
    inactive: { scale: 0.8, opacity: 0.4 },
    active: {
      scale: 1.2,
      opacity: 1,
      transition: { type: "spring", stiffness: 500 },
    },
    complete: { scale: 1, opacity: 0.7 },
  },
};

// ==========================================
// STAGGER CONFIGURATIONS
// ==========================================
export const stagger = {
  /** Dealing player cards */
  cards: { staggerChildren: TIMING.card.stagger, delayChildren: 0.1 },
  /** Flop (3 community cards) */
  flopReveal: { staggerChildren: 0.2, delayChildren: 0.3 },
  /** Chip tosses */
  chips: { staggerChildren: TIMING.chip.stagger },
  /** Chip rain on big wins */
  chipRain: { staggerChildren: 0.08, delayChildren: 0.2 },
  /** Menu item cascade */
  menuItems: { staggerChildren: 0.1, delayChildren: 0.2 },
  /** Character selection grid */
  characterGrid: { staggerChildren: 0.15, delayChildren: 0.1 },
};

// ==========================================
// CELEBRATION INTENSITY LEVELS
// ==========================================
export const celebrationIntensity = {
  /** Normal win */
  small: { particles: 20, duration: 1.5, chipRain: false, glow: 0.08 },
  /** Big pot win */
  medium: { particles: 40, duration: 2.0, chipRain: false, glow: 0.12 },
  /** All-in win */
  large: { particles: 60, duration: 2.5, chipRain: true, glow: 0.2 },
  /** Royal flush / game over */
  jackpot: { particles: 100, duration: 3.0, chipRain: true, glow: 0.3 },
} as const;
