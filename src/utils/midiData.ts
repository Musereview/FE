// practice-data API의 midiData 필드(JSON 문자열) 파싱 + 변환
// - recording: 정답 멜로디 — MusicXML 생성(및 향후 채점 정답 소스)
// - options: 곡 메타(bpm/박자표/조성) — MusicXML 옵션과 필드명이 그대로 대응됨
// - chords: 코드 진행 — 상단 백킹트랙 표시(+ 명세상 채점에도 쓰일 예정)용, 악보엔 그리지 않음
import type { PlayedNote } from '@/stores/practiceResultStore';
import type { ChordMeasure } from '@/types/track';
import { buildMusicXmlFromRecording } from './recordingToMusicXml';

export interface MidiDataNote {
  midi: number;
  velocity: number;
  start: number; // 시작 박(0-based, beatType 단위)
  duration: number; // 지속 박 수(beatType 단위)
}

export interface MidiDataOptions {
  bpm: number; // 4분음표 기준 템포
  beatsPerBar: number; // 박자표 분자
  beatType: number; // 박자표 분모
  key: string;
  mode: 'major' | 'minor';
  title: string;
}

export interface MidiDataChord {
  bar: number; // 코드 시작 마디(1-based)
  beat: number; // 마디 내 시작 박(1-based)
  symbol: string; // 코드 심볼 (예: 'Dm7')
}

export interface ParsedMidiData {
  recording: MidiDataNote[];
  options: MidiDataOptions;
  chords: MidiDataChord[];
}

const DEFAULT_OPTIONS: MidiDataOptions = {
  bpm: 120,
  beatsPerBar: 4,
  beatType: 4,
  key: 'C',
  mode: 'major',
  title: '',
};

function isFinitePositive(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

// null/필드 누락/문자열 등 구조가 깨진 노트는 이후 계산(beatToSec, measureCount 등)에서 크래시로 이어지므로 걸러냄
function isValidNote(n: unknown): n is MidiDataNote {
  if (typeof n !== 'object' || n === null) return false;
  const note = n as Partial<MidiDataNote>;
  return (
    typeof note.midi === 'number' &&
    Number.isFinite(note.midi) &&
    typeof note.velocity === 'number' &&
    Number.isFinite(note.velocity) &&
    typeof note.start === 'number' &&
    Number.isFinite(note.start) &&
    note.start >= 0 &&
    isFinitePositive(note.duration)
  );
}

function isValidChord(c: unknown): c is MidiDataChord {
  if (typeof c !== 'object' || c === null) return false;
  const chord = c as Partial<MidiDataChord>;
  return isFinitePositive(chord.bar) && isFinitePositive(chord.beat) && typeof chord.symbol === 'string';
}

// bpm/beatsPerBar/beatType은 0 이하·NaN·Infinity면 나눗셈(beatToSec)과 배열 길이(Array.from) 계산이
// Infinity/NaN으로 새서 무한 루프·RangeError로 이어지므로, 필드별로 유효성 검증 후 기본값으로 대체
function sanitizeOptions(raw: Partial<MidiDataOptions> | undefined): MidiDataOptions {
  const o = raw ?? {};
  return {
    bpm: isFinitePositive(o.bpm) ? o.bpm : DEFAULT_OPTIONS.bpm,
    beatsPerBar: isFinitePositive(o.beatsPerBar) ? o.beatsPerBar : DEFAULT_OPTIONS.beatsPerBar,
    beatType: isFinitePositive(o.beatType) ? o.beatType : DEFAULT_OPTIONS.beatType,
    key: typeof o.key === 'string' ? o.key : DEFAULT_OPTIONS.key,
    mode: o.mode === 'minor' ? 'minor' : DEFAULT_OPTIONS.mode,
    title: typeof o.title === 'string' ? o.title : DEFAULT_OPTIONS.title,
  };
}

// midiData 파싱. 명세는 JSON 문자열이지만 백엔드가 이미 파싱된 객체로 내려주는 경우도 있어 둘 다 허용.
// 형식이 깨졌거나 비어있으면(예: mock '{}') 빈 곡으로 안전 처리.
export function parseMidiData(raw: string | Partial<ParsedMidiData>): ParsedMidiData {
  try {
    const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<ParsedMidiData>;
    return {
      recording: Array.isArray(parsed.recording) ? parsed.recording.filter(isValidNote) : [],
      options: sanitizeOptions(parsed.options),
      chords: Array.isArray(parsed.chords) ? parsed.chords.filter(isValidChord) : [],
    };
  } catch (err) {
    console.warn('[midiData] 파싱 실패, 빈 곡으로 대체:', err);
    return { recording: [], options: DEFAULT_OPTIONS, chords: [] };
  }
}

// beatType 기준 박 값을 초로 변환 (bpm은 4분음표 기준 템포라는 표준 관례를 따름)
function beatToSec(beat: number, options: MidiDataOptions): number {
  return beat * (4 / options.beatType) * (60 / options.bpm);
}

export function midiDataToPlayedNotes(recording: MidiDataNote[], options: MidiDataOptions): PlayedNote[] {
  return recording.map((n) => ({
    midi: n.midi,
    velocity: n.velocity,
    onSec: beatToSec(n.start, options),
    offSec: beatToSec(n.start + n.duration, options),
  }));
}

// 정답 멜로디 → OSMD가 그릴 MusicXML (녹음→악보 변환기를 그대로 재사용)
export function midiDataToMusicXml(data: ParsedMidiData): string {
  return buildMusicXmlFromRecording(midiDataToPlayedNotes(data.recording, data.options), data.options);
}

// 곡 전체 마디 수: 노트가 끝나는 지점과 코드가 있는 마지막 마디 중 더 큰 쪽.
// (코드 진행이 마지막 마디까지 채워지지 않아도 재생/채점 루프는 노트 끝까지 돌아야 함)
export function midiDataMeasureCount(data: ParsedMidiData): number {
  const { recording, chords, options } = data;
  const maxEndBeat = recording.reduce((max, n) => Math.max(max, n.start + n.duration), 0);
  const maxChordBar = chords.reduce((max, c) => Math.max(max, c.bar), 0);
  return Math.max(1, Math.ceil(maxEndBeat / options.beatsPerBar), maxChordBar);
}

// 코드 진행 → 백킹트랙 표시용 그리드. measureCount는 midiDataMeasureCount()로 구해 전체 곡 길이와 맞춘다.
export function midiDataChordsToMeasures(
  chords: MidiDataChord[],
  measureCount: number,
  beatsPerBar: number,
): ChordMeasure[] {
  const measures: ChordMeasure[] = Array.from({ length: measureCount }, () => Array(beatsPerBar).fill(null));
  for (const c of chords) {
    const barIdx = c.bar - 1;
    const beatIdx = c.beat - 1;
    if (measures[barIdx] && beatIdx >= 0 && beatIdx < beatsPerBar) measures[barIdx][beatIdx] = c.symbol;
  }
  return measures;
}
