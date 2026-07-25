import type { KeyMode, ChordMeasure } from '@/types/track';

export { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/constants/difficulty';

/** mock 로그인 사용자 (인증 전) */
export const CURRENT_USER = '김뮤즈';

export function buildFallbackProgression(chords: string[], numerator: number, measureCount = 8): ChordMeasure[] {
  if (chords.length === 0) return [];
  return Array.from({ length: measureCount }, (_, measureIndex) => {
    const chord = chords[measureIndex % chords.length];
    return Array.from({ length: numerator }, (_, beat) => (beat === 0 ? chord : null));
  });
}

export const MODE_LABEL: Record<KeyMode, string> = {
  major: 'Major',
  minor: 'Minor',
};
