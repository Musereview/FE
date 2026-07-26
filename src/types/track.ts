export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type KeyMode = 'major' | 'minor';

/** 코드 바뀌는 박자만 값, 나머지는 null */
export type ChordMeasure = (string | null)[];

export interface Track {
  id: string;
  title: string;
  key: string;
  mode: KeyMode;
  timeSignature: string;
  chords: string[];
  genre: string;
  bpm: number;
  difficulty: TrackDifficulty;
  duration: string;
  popularity: number;
  createdAt: string;
  creator: string;
  /** 없으면 chords로 fallback 생성 */
  chordProgression?: ChordMeasure[];
}
