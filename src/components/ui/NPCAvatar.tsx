"use client";

export default function NPCAvatar({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#1a1a2e" stroke="#d4af37" strokeWidth="2" />
      {/* Hair */}
      <ellipse cx="50" cy="35" rx="22" ry="24" fill="#2a1a0a" />
      <ellipse cx="50" cy="25" rx="20" ry="18" fill="#3a2a1a" />
      {/* Long hair sides */}
      <path d="M28 35 Q25 55 30 75 Q32 65 34 55 Q30 45 28 35Z" fill="#2a1a0a" />
      <path d="M72 35 Q75 55 70 75 Q68 65 66 55 Q70 45 72 35Z" fill="#2a1a0a" />
      {/* Face */}
      <ellipse cx="50" cy="42" rx="16" ry="18" fill="#e8c9a0" />
      {/* Eyes */}
      <ellipse cx="43" cy="40" rx="2.5" ry="1.8" fill="#1a1a2e" />
      <ellipse cx="57" cy="40" rx="2.5" ry="1.8" fill="#1a1a2e" />
      {/* Eyelashes */}
      <path d="M40 38 Q42 36 44 38" stroke="#1a1a2e" strokeWidth="0.8" fill="none" />
      <path d="M54 38 Q56 36 58 38" stroke="#1a1a2e" strokeWidth="0.8" fill="none" />
      {/* Nose */}
      <path d="M49 44 Q50 46 51 44" stroke="#c9a880" strokeWidth="0.8" fill="none" />
      {/* Lips */}
      <path d="M45 49 Q50 52 55 49" stroke="#c06060" strokeWidth="1.5" fill="#c06060" fillOpacity="0.4" />
      {/* Necklace */}
      <path d="M35 62 Q50 70 65 62" stroke="#d4af37" strokeWidth="1.2" fill="none" />
      <circle cx="50" cy="67" r="2" fill="#d4af37" />
      {/* Shoulders/dress */}
      <path d="M30 75 Q35 65 50 63 Q65 65 70 75 Q70 85 65 95 L35 95 Q30 85 30 75Z" fill="#8b0000" />
      {/* Dress shine */}
      <path d="M40 70 Q50 68 60 70 Q55 75 50 78 Q45 75 40 70Z" fill="#a00000" opacity="0.5" />
    </svg>
  );
}
