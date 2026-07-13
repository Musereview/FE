import type { TrackDifficulty, KeyMode, ChordMeasure } from '@/types/track';

/** mock 로그인 사용자 (인증 전) */
export const CURRENT_USER = '김뮤즈';

export function buildFallbackProgression(chords: string[], numerator: number, measureCount = 8): ChordMeasure[] {
  if (chords.length === 0) return [];
  return Array.from({ length: measureCount }, (_, measureIndex) => {
    const chord = chords[measureIndex % chords.length];
    return Array.from({ length: numerator }, (_, beat) => (beat === 0 ? chord : null));
  });
}

export const DIFFICULTY_LABEL: Record<TrackDifficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

export const DIFFICULTY_COLOR: Record<TrackDifficulty, string> = {
  beginner: 'border-level-bgn text-level-bgn',
  intermediate: 'border-level-int text-level-int',
  advanced: 'border-level-mjr text-level-mjr',
};

export const MODE_LABEL: Record<KeyMode, string> = {
  major: 'Major',
  minor: 'Minor',
};
