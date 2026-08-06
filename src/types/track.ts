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

export type BackingTrackGenre = string;
export type BackingTrackScaleType = 'MAJOR' | 'MINOR';
export type BackingTrackLevel = 'BASIC' | 'MED' | 'ADVANCED';

// GET /api/backing-tracks 응답 항목
export interface BackingTrackListItem {
  backingTrackId: number;
  title: string;
  genre: BackingTrackGenre;
  keySignature: string;
  scaleType: BackingTrackScaleType;
  timeSignature: string;
  chordProgression: string[];
  bpm: number;
  level: BackingTrackLevel;
  playtimeSec: number;
}

// GET /api/backing-tracks 응답 data
export interface BackingTrackListResponse {
  tracks: BackingTrackListItem[];
  nextCursor: number | null;
  hasNext: boolean;
}

// GET /api/backing-tracks/recommended 응답 data
export interface RecommendedBackingTracksResponse {
  recommendedTracks: RecommendedBackingTrackItem[];
}

// GET /api/backing-tracks/recommended 응답 항목
export interface RecommendedBackingTrackItem {
  backingTrackId: number;
  title: string;
  genre: BackingTrackGenre;
  keySignature: string;
  scaleType: BackingTrackScaleType;
  timeSignature: string;
  chordProgression: string[];
  bpm: number;
  level: BackingTrackLevel;
  playtimeSec: number;
  playCount: number;
}

export interface BackingTrackChordEntry {
  measureNo: number;
  sequenceNo: number;
  chordName: string;
}

// GET /api/backing-tracks/{backingTrackId} 응답 data
export interface BackingTrackDetail {
  backingTrackId: number;
  title: string;
  genre: BackingTrackGenre;
  keySignature: string;
  scaleType: BackingTrackScaleType;
  timeSignature: string;
  bpm: number;
  playtimeSec: number;
  level: BackingTrackLevel;
  creatorName: string;
  audioFileUrl: string;
  chordProgression: BackingTrackChordEntry[];
}
