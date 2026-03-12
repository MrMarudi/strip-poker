'use client';

import React from 'react';

interface CardSVGProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  width?: number;
  height?: number;
  className?: string;
}

const SUIT_SYMBOLS: Record<CardSVGProps['suit'], string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const SUIT_COLORS: Record<CardSVGProps['suit'], string> = {
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
};

const FACE_CARD_LABELS: Record<string, string> = {
  J: 'J',
  Q: 'Q',
  K: 'K',
};

function isFaceCard(rank: string): rank is 'J' | 'Q' | 'K' {
  return rank === 'J' || rank === 'Q' || rank === 'K';
}

/**
 * Generates the positions for suit symbols in the center area of number cards.
 * The layout follows standard playing card pip arrangements.
 */
function getPipPositions(rank: string): Array<{ x: number; y: number }> {
  const cx = 50;
  const left = 32;
  const right = 68;
  const top = 30;
  const upperMid = 40;
  const mid = 50;
  const lowerMid = 60;
  const bottom = 70;

  switch (rank) {
    case 'A':
      return [{ x: cx, y: mid }];
    case '2':
      return [
        { x: cx, y: top },
        { x: cx, y: bottom },
      ];
    case '3':
      return [
        { x: cx, y: top },
        { x: cx, y: mid },
        { x: cx, y: bottom },
      ];
    case '4':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '5':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: cx, y: mid },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '6':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: mid },
        { x: right, y: mid },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '7':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: cx, y: upperMid },
        { x: left, y: mid },
        { x: right, y: mid },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '8':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: cx, y: upperMid },
        { x: left, y: mid },
        { x: right, y: mid },
        { x: cx, y: lowerMid },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '9':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: upperMid },
        { x: right, y: upperMid },
        { x: cx, y: mid },
        { x: left, y: lowerMid },
        { x: right, y: lowerMid },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    case '10':
      return [
        { x: left, y: top },
        { x: right, y: top },
        { x: cx, y: 35 },
        { x: left, y: upperMid },
        { x: right, y: upperMid },
        { x: left, y: lowerMid },
        { x: right, y: lowerMid },
        { x: cx, y: 65 },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
    default:
      return [];
  }
}

const CardSVG: React.FC<CardSVGProps> = ({
  suit,
  rank,
  width = 100,
  height = 140,
  className,
}) => {
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];
  const pips = getPipPositions(rank);
  const face = isFaceCard(rank);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 140"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`${rank} of ${suit}`}
    >
      <defs>
        {/* Drop shadow filter */}
        <filter id={`card-shadow-${suit}-${rank}`} x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Card body */}
      <rect
        x="1"
        y="1"
        width="98"
        height="138"
        rx="8"
        ry="8"
        fill="#ffffff"
        stroke="#2a2a3a"
        strokeWidth="1"
        filter={`url(#card-shadow-${suit}-${rank})`}
      />

      {/* ---- Top-left corner: rank + suit ---- */}
      <text
        x="8"
        y="18"
        fill={color}
        fontSize="13"
        fontWeight="bold"
        fontFamily="Georgia, 'Times New Roman', serif"
        textAnchor="middle"
      >
        {rank}
      </text>
      <text
        x="8"
        y="29"
        fill={color}
        fontSize="11"
        fontFamily="Georgia, 'Times New Roman', serif"
        textAnchor="middle"
      >
        {symbol}
      </text>

      {/* ---- Bottom-right corner: rank + suit (rotated 180deg) ---- */}
      <g transform="rotate(180, 50, 70)">
        <text
          x="8"
          y="18"
          fill={color}
          fontSize="13"
          fontWeight="bold"
          fontFamily="Georgia, 'Times New Roman', serif"
          textAnchor="middle"
        >
          {rank}
        </text>
        <text
          x="8"
          y="29"
          fill={color}
          fontSize="11"
          fontFamily="Georgia, 'Times New Roman', serif"
          textAnchor="middle"
        >
          {symbol}
        </text>
      </g>

      {/* ---- Center content ---- */}
      {face ? (
        /* Face card: large decorative letter */
        <g>
          {/* Decorative background circle */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity="0.4"
          />
          {/* Inner circle accent */}
          <circle
            cx="50"
            cy="50"
            r="17"
            fill={color}
            opacity="0.08"
          />
          {/* Face card letter */}
          <text
            x="50"
            y="57"
            fill={color}
            fontSize="30"
            fontWeight="bold"
            fontFamily="Georgia, 'Times New Roman', serif"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {FACE_CARD_LABELS[rank]}
          </text>
          {/* Small suit symbols around the face letter */}
          <text
            x="50"
            y="32"
            fill={color}
            fontSize="8"
            fontFamily="Georgia, 'Times New Roman', serif"
            textAnchor="middle"
          >
            {symbol}
          </text>
          <text
            x="50"
            y="74"
            fill={color}
            fontSize="8"
            fontFamily="Georgia, 'Times New Roman', serif"
            textAnchor="middle"
          >
            {symbol}
          </text>
        </g>
      ) : rank === 'A' ? (
        /* Ace: single large suit symbol */
        <text
          x="50"
          y="56"
          fill={color}
          fontSize="38"
          fontFamily="Georgia, 'Times New Roman', serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {symbol}
        </text>
      ) : (
        /* Number cards: pip layout */
        <g>
          {pips.map((pip, i) => (
            <text
              key={i}
              x={pip.x}
              y={pip.y}
              fill={color}
              fontSize="14"
              fontFamily="Georgia, 'Times New Roman', serif"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {symbol}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
};

export default CardSVG;
