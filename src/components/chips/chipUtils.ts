export interface ChipDenomination {
  value: number;
  color: string;
  borderColor: string;
  label: string;
}

export const DENOMINATIONS: ChipDenomination[] = [
  { value: 500, color: '#d4af37', borderColor: '#b8941e', label: '500' },  // gold
  { value: 100, color: '#1a1a2e', borderColor: '#333', label: '100' },      // black
  { value: 25,  color: '#2d6a4f', borderColor: '#1a472a', label: '25' },    // green
  { value: 10,  color: '#2563eb', borderColor: '#1d4ed8', label: '10' },    // blue
  { value: 5,   color: '#c41e3a', borderColor: '#9b1830', label: '5' },     // red
  { value: 1,   color: '#e5e5e5', borderColor: '#ccc', label: '1' },        // white
];

export function valueToChipBreakdown(amount: number): { denomination: ChipDenomination; count: number }[] {
  const result: { denomination: ChipDenomination; count: number }[] = [];
  let remaining = amount;
  for (const denom of DENOMINATIONS) {
    const count = Math.floor(remaining / denom.value);
    if (count > 0) {
      result.push({ denomination: denom, count });
      remaining -= count * denom.value;
    }
  }
  return result;
}
