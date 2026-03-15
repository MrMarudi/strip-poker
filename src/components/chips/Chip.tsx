'use client';

import React from 'react';
import { TOKENS } from '@/design/tokens';
import type { ChipDenomination } from './chipUtils';

export interface ChipProps {
  denomination: ChipDenomination;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 28, md: 36, lg: 48 } as const;
const FONT_MAP = { sm: 9, md: 11, lg: 14 } as const;

export default function Chip({ denomination, size = 'md', className }: ChipProps) {
  const px = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const { color, borderColor, label } = denomination;

  // Lighten color for top highlight
  const highlightColor = `rgba(255,255,255,0.25)`;
  const shadowColor = `rgba(0,0,0,0.35)`;

  return (
    <div
      className={className}
      style={{
        width: px,
        height: px,
        borderRadius: TOKENS.radius.chip,
        background: `radial-gradient(circle at 35% 35%, ${highlightColor}, ${color} 50%, ${shadowColor})`,
        border: `2px solid ${borderColor}`,
        boxShadow: TOKENS.shadows.chip,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Inner embossed circle */}
      <div
        style={{
          width: px * 0.6,
          height: px * 0.6,
          borderRadius: TOKENS.radius.chip,
          border: `1px solid rgba(212,175,55,0.4)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1), transparent)`,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            fontFamily: TOKENS.typography.fontDisplay,
            color: denomination.value >= 100 && denomination.value !== 500
              ? '#e5e5e5'
              : denomination.value === 1
                ? '#333'
                : '#fff',
            textShadow: '0 1px 1px rgba(0,0,0,0.5)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
