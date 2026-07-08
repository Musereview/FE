export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type KeyMode = 'major' | 'minor';

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
}
