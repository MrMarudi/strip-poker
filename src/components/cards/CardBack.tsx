'use client';

import React from 'react';
import Image from 'next/image';

interface CardBackProps {
  style?: 'classic' | 'elegant' | 'modern' | 'premium';
  width?: number;
  height?: number;
  className?: string;
}

const CardBack: React.FC<CardBackProps> = ({
  style = 'premium',
  width = 100,
  height = 140,
  className,
}) => {
  if (style === 'premium') {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.15)',
        }}
      >
        <Image
          src="/cards/back.png"
          alt="Card back"
          fill
          sizes={`${width}px`}
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 140"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Card back"
    >
      <defs>
        {/* Inner glow filter shared by all styles */}
        <filter id="card-back-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.83
                    0 0 0 0 0.69
                    0 0 0 0 0.22
                    0 0 0 0.4 0"
            result="glowColor"
          />
          <feComposite in="glowColor" in2="SourceGraphic" operator="atop" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ---- Classic style patterns ---- */}
        <pattern id="classic-diamonds" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#8b0000" />
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="#d4af37" strokeWidth="0.6" opacity="0.6" />
        </pattern>
        <pattern id="classic-crosshatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="transparent" />
          <line x1="0" y1="0" x2="8" y2="8" stroke="#d4af37" strokeWidth="0.4" opacity="0.35" />
          <line x1="8" y1="0" x2="0" y2="8" stroke="#d4af37" strokeWidth="0.4" opacity="0.35" />
        </pattern>

        {/* ---- Elegant style patterns ---- */}
        <pattern id="elegant-ornate" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="transparent" />
          <circle cx="10" cy="10" r="6" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.3" />
          <circle cx="10" cy="10" r="2" fill="#d4af37" opacity="0.15" />
          <circle cx="0" cy="0" r="2" fill="none" stroke="#d4af37" strokeWidth="0.4" opacity="0.25" />
          <circle cx="20" cy="0" r="2" fill="none" stroke="#d4af37" strokeWidth="0.4" opacity="0.25" />
          <circle cx="0" cy="20" r="2" fill="none" stroke="#d4af37" strokeWidth="0.4" opacity="0.25" />
          <circle cx="20" cy="20" r="2" fill="none" stroke="#d4af37" strokeWidth="0.4" opacity="0.25" />
        </pattern>

        {/* ---- Modern style patterns ---- */}
        <pattern id="modern-geo" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="transparent" />
          <rect x="2" y="2" width="5" height="5" fill="none" stroke="#c0c0d0" strokeWidth="0.5" opacity="0.3" />
          <rect x="9" y="9" width="5" height="5" fill="none" stroke="#c0c0d0" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#c0c0d0" strokeWidth="0.3" opacity="0.15" />
          <line x1="8" y1="0" x2="8" y2="16" stroke="#c0c0d0" strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>

      {style === 'classic' && <ClassicBack />}
      {style === 'elegant' && <ElegantBack />}
      {style === 'modern' && <ModernBack />}
    </svg>
  );
};

/* ======================== Classic Style ======================== */
const ClassicBack: React.FC = () => (
  <g>
    {/* Outer card shape */}
    <rect
      x="1"
      y="1"
      width="98"
      height="138"
      rx="8"
      ry="8"
      fill="#8b0000"
      stroke="#d4af37"
      strokeWidth="1.2"
    />

    {/* Diamond pattern fill */}
    <rect
      x="6"
      y="6"
      width="88"
      height="128"
      rx="5"
      ry="5"
      fill="url(#classic-diamonds)"
    />

    {/* Crosshatch overlay */}
    <rect
      x="6"
      y="6"
      width="88"
      height="128"
      rx="5"
      ry="5"
      fill="url(#classic-crosshatch)"
    />

    {/* Inner border */}
    <rect
      x="10"
      y="10"
      width="80"
      height="120"
      rx="4"
      ry="4"
      fill="none"
      stroke="#d4af37"
      strokeWidth="1"
      opacity="0.7"
    />

    {/* Second inner border */}
    <rect
      x="14"
      y="14"
      width="72"
      height="112"
      rx="3"
      ry="3"
      fill="none"
      stroke="#d4af37"
      strokeWidth="0.5"
      opacity="0.5"
    />

    {/* Center ornament */}
    <g opacity="0.6" filter="url(#card-back-glow)">
      <ellipse cx="50" cy="70" rx="16" ry="20" fill="none" stroke="#d4af37" strokeWidth="1" />
      <ellipse cx="50" cy="70" rx="10" ry="14" fill="none" stroke="#d4af37" strokeWidth="0.7" />
      <text
        x="50"
        y="70"
        fill="#d4af37"
        fontSize="16"
        fontFamily="Georgia, 'Times New Roman', serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {'\u2666'}
      </text>
    </g>
  </g>
);

/* ======================== Elegant Style ======================== */
const ElegantBack: React.FC = () => (
  <g>
    {/* Outer card shape */}
    <rect
      x="1"
      y="1"
      width="98"
      height="138"
      rx="8"
      ry="8"
      fill="#2d1b4e"
      stroke="#d4af37"
      strokeWidth="1.2"
    />

    {/* Ornate pattern fill */}
    <rect
      x="6"
      y="6"
      width="88"
      height="128"
      rx="5"
      ry="5"
      fill="url(#elegant-ornate)"
    />

    {/* Decorative border frame */}
    <rect
      x="10"
      y="10"
      width="80"
      height="120"
      rx="4"
      ry="4"
      fill="none"
      stroke="#d4af37"
      strokeWidth="1.2"
      opacity="0.6"
    />

    {/* Corner decorations */}
    {[
      { cx: 18, cy: 18 },
      { cx: 82, cy: 18 },
      { cx: 18, cy: 122 },
      { cx: 82, cy: 122 },
    ].map((pos, i) => (
      <g key={i} opacity="0.5">
        <circle cx={pos.cx} cy={pos.cy} r="4" fill="none" stroke="#d4af37" strokeWidth="0.8" />
        <circle cx={pos.cx} cy={pos.cy} r="1.5" fill="#d4af37" opacity="0.5" />
      </g>
    ))}

    {/* Ornate inner frame */}
    <rect
      x="16"
      y="16"
      width="68"
      height="108"
      rx="3"
      ry="3"
      fill="none"
      stroke="#d4af37"
      strokeWidth="0.5"
      strokeDasharray="4 2 1 2"
      opacity="0.4"
    />

    {/* Center crest */}
    <g opacity="0.7" filter="url(#card-back-glow)">
      {/* Shield shape */}
      <path
        d="M50 48 L65 55 L65 72 Q65 82 50 90 Q35 82 35 72 L35 55 Z"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1"
      />
      <path
        d="M50 52 L61 57 L61 71 Q61 79 50 86 Q39 79 39 71 L39 57 Z"
        fill="#d4af37"
        opacity="0.1"
      />
      {/* Crown symbol */}
      <text
        x="50"
        y="72"
        fill="#d4af37"
        fontSize="18"
        fontFamily="Georgia, 'Times New Roman', serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {'\u2660'}
      </text>
    </g>
  </g>
);

/* ======================== Modern Style ======================== */
const ModernBack: React.FC = () => (
  <g>
    {/* Outer card shape */}
    <rect
      x="1"
      y="1"
      width="98"
      height="138"
      rx="8"
      ry="8"
      fill="#1a1a3e"
      stroke="#d4af37"
      strokeWidth="1.2"
    />

    {/* Geometric pattern fill */}
    <rect
      x="6"
      y="6"
      width="88"
      height="128"
      rx="5"
      ry="5"
      fill="url(#modern-geo)"
    />

    {/* Horizontal accent lines */}
    {[30, 50, 70, 90, 110].map((y) => (
      <line
        key={y}
        x1="12"
        y1={y}
        x2="88"
        y2={y}
        stroke="#c0c0d0"
        strokeWidth="0.3"
        opacity="0.2"
      />
    ))}

    {/* Border frame */}
    <rect
      x="10"
      y="10"
      width="80"
      height="120"
      rx="4"
      ry="4"
      fill="none"
      stroke="#c0c0d0"
      strokeWidth="0.8"
      opacity="0.4"
    />

    {/* Center geometric design */}
    <g opacity="0.6" filter="url(#card-back-glow)">
      {/* Outer octagon approximation */}
      <polygon
        points="50,45 63,50 68,63 68,77 63,90 50,95 37,90 32,77 32,63 37,50"
        fill="none"
        stroke="#c0c0d0"
        strokeWidth="0.8"
      />
      {/* Inner diamond */}
      <polygon
        points="50,52 60,70 50,88 40,70"
        fill="none"
        stroke="#c0c0d0"
        strokeWidth="0.6"
      />
      {/* Center dot */}
      <circle cx="50" cy="70" r="3" fill="#c0c0d0" opacity="0.3" />
      <circle cx="50" cy="70" r="1.2" fill="#ffffff" opacity="0.5" />
    </g>

    {/* Corner accent dots */}
    {[
      { cx: 16, cy: 16 },
      { cx: 84, cy: 16 },
      { cx: 16, cy: 124 },
      { cx: 84, cy: 124 },
    ].map((pos, i) => (
      <circle
        key={i}
        cx={pos.cx}
        cy={pos.cy}
        r="2"
        fill="#c0c0d0"
        opacity="0.3"
      />
    ))}
  </g>
);

export default CardBack;
