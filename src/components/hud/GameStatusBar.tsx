'use client';

interface GameStatusBarProps {
  roundNumber: number;
  handsWon: number;
  handsLost: number;
  blinds: { small: number; big: number };
}

export default function GameStatusBar({
  roundNumber,
  handsWon,
  handsLost,
  blinds,
}: GameStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-2 sm:px-5 py-1 sm:py-1.5 bg-[#07060a]/70 border-b border-[#d4af37]/10 backdrop-blur-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
        Round #{roundNumber}
      </span>

      <div className="flex items-center gap-1 text-xs text-[#f0e8d0]/50">
        <span>
          Won: <span className="text-[#2d6a4f] font-semibold">{handsWon}</span>
        </span>
        <span className="text-[#f0e8d0]/20 mx-1">|</span>
        <span>
          Lost: <span className="text-[#c41e3a] font-semibold">{handsLost}</span>
        </span>
      </div>

      <span className="text-xs text-[#f0e8d0]/50">
        Blinds:{' '}
        <span className="text-[#d4af37]/80 font-semibold">
          ${blinds.small}/{blinds.big}
        </span>
      </span>
    </div>
  );
}
