import type {
  KeyMode,
  ChordMeasure,
  Track,
  BackingTrackListItem,
  BackingTrackDetail,
  BackingTrackChordEntry,
  BackingTrackLevel,
  RecommendedBackingTrackItem,
} from '@/types/track';
import type { Difficulty } from '@/constants/difficulty';
import { getChordsPerMeasure } from '@/components/practice/create/chordGrid';

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

export const LEVEL_MAP: Record<BackingTrackLevel, Difficulty> = {
  BASIC: 'beginner',
  MED: 'intermediate',
  ADVANCED: 'advanced',
};

// 목록 API 응답엔 박자 정보가 없어 카드 표시용 임시 고정값 사용
const DEFAULT_TIME_SIGNATURE = '4/4';

export function formatDuration(playtimeSec: number): string {
  const minutes = Math.floor(playtimeSec / 60);
  const seconds = playtimeSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildChordMeasures(entries: BackingTrackChordEntry[], numerator: number): ChordMeasure[] {
  if (entries.length === 0) return [];
  const measureCount = Math.max(...entries.map((entry) => entry.measureNo));
  const measures: ChordMeasure[] = Array.from({ length: measureCount }, () =>
    Array.from({ length: numerator }, () => null),
  );

  entries.forEach(({ measureNo, sequenceNo, chordName }) => {
    const measureIndex = measureNo - 1;
    const beatIndex = sequenceNo - 1;
    if (measures[measureIndex] && beatIndex < numerator) {
      measures[measureIndex][beatIndex] = chordName;
    }
  });

  return measures;
}

function uniqueChordNames(entries: BackingTrackChordEntry[]): string[] {
  return [...new Set(entries.map((entry) => entry.chordName))];
}

export function mapListItemToTrack(item: BackingTrackListItem): Track {
  return {
    id: String(item.backingTrackId),
    title: item.title,
    key: item.keySignature,
    mode: item.scaleType.toLowerCase() as KeyMode,
    timeSignature: DEFAULT_TIME_SIGNATURE,
    chords: item.chordProgression,
    genre: item.genre,
    bpm: item.bpm,
    difficulty: LEVEL_MAP[item.level],
    duration: formatDuration(item.playtimeSec),
    popularity: 0,
    createdAt: '',
    creator: '',
  };
}

export function mapRecommendedItemToTrack(item: RecommendedBackingTrackItem): Track {
  return {
    id: String(item.backingTrackId),
    title: item.title,
    key: item.keySignature,
    mode: item.scaleType.toLowerCase() as KeyMode,
    timeSignature: item.timeSignature,
    chords: item.chordProgression,
    genre: item.genre,
    bpm: item.bpm,
    difficulty: LEVEL_MAP[item.level],
    duration: formatDuration(item.playtimeSec),
    popularity: item.playCount,
    createdAt: '',
    creator: '',
  };
}

export function mapDetailToTrack(detail: BackingTrackDetail): Track {
  const numerator = getChordsPerMeasure(detail.timeSignature);

  return {
    id: String(detail.backingTrackId),
    title: detail.title,
    key: detail.keySignature,
    mode: detail.scaleType.toLowerCase() as KeyMode,
    timeSignature: detail.timeSignature,
    chords: uniqueChordNames(detail.chordProgression),
    genre: detail.genre,
    bpm: detail.bpm,
    difficulty: LEVEL_MAP[detail.level],
    duration: formatDuration(detail.playtimeSec),
    popularity: 0,
    createdAt: '',
    creator: detail.creatorName,
    chordProgression: buildChordMeasures(detail.chordProgression, numerator),
  };
}
