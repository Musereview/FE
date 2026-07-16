// MIDI 노트 범위: 88건반 A0(21)~C8(108), 61건반 C2(36)~C7(96)
export const PIANO_RANGE = {
  88: { start: 21, end: 108 },
  61: { start: 36, end: 96 },
} as const;

export type KeyCount = keyof typeof PIANO_RANGE;

export const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

// Piano.tsx 기준: 검은 건반 폭 = 흰 건반 폭의 70.175%
export const BLACK_KEY_WIDTH_RATIO = 0.70175;

// 흰 건반 개수 (전체 건반 폭 = 흰 건반 폭 × 개수)
export function whiteKeyCount(keyCount: KeyCount): number {
  const { start, end } = PIANO_RANGE[keyCount];
  let count = 0;
  for (let m = start; m <= end; m++) if (!isBlackKey(m)) count++;
  return count;
}

/**
 * MIDI 음의 건반 가로 폭을 전체 건반 폭 대비 0~1 비율로 반환.
 * 흰 건반 = 1/흰건반수, 검은 건반 = 그 70.175%.
 */
export function noteWidthFraction(midi: number, keyCount: KeyCount): number {
  const white = 1 / whiteKeyCount(keyCount);
  return isBlackKey(midi) ? white * BLACK_KEY_WIDTH_RATIO : white;
}

/**
 * MIDI 음의 건반 가로 중심 위치를 0~1 비율로 반환.
 * Piano.tsx의 레이아웃(흰 건반 flex-1 균등, 검은 건반은 아래 흰 건반 오른쪽 경계 중앙)과 동일하게 계산.
 * 범위 밖이면 -1.
 */
export function noteCenterFraction(midi: number, keyCount: KeyCount): number {
  const { start, end } = PIANO_RANGE[keyCount];
  if (midi < start || midi > end) return -1;

  const whites: number[] = [];
  for (let m = start; m <= end; m++) if (!isBlackKey(m)) whites.push(m);
  const n = whites.length;

  if (!isBlackKey(midi)) {
    const idx = whites.indexOf(midi);
    return idx === -1 ? -1 : (idx + 0.5) / n; // 흰 건반 → 칸 중앙
  }
  // 검은 건반 → 바로 아래 흰 건반(midi-1)과 다음 흰 건반 사이 경계
  const idx = whites.indexOf(midi - 1);
  return idx === -1 ? -1 : (idx + 1) / n;
}
