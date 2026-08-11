import type { BackingTrackChordEntry, ChordMeasure } from '@/types/track';
import type { ChordCell } from './ChordProgressionGrid';

const MEASURE_COUNT = 8;
// 백킹트랙 오디오 파일 없이 생성하는 경우의 기본 반복 횟수 (8마디 × 4회, 서승기 백엔드와 합의)
const DEFAULT_REPEAT_COUNT = 4;

export function getChordsPerMeasure(timeSignature: string) {
  return Number(timeSignature.split('/')[0]) || 4;
}

// 박자 단위(beat)로 평탄화된 코드 배열 → 마디 단위 라벨 목록. 마디 안에서 연속으로 반복되는 코드는 하나로 묶음
export function groupChordsByMeasure(chords: string[], timeSignature: string): string[] {
  const beatsPerMeasure = getChordsPerMeasure(timeSignature);
  const measures: string[] = [];

  for (let i = 0; i < chords.length; i += beatsPerMeasure) {
    const beats = chords.slice(i, i + beatsPerMeasure);
    const uniqueInOrder: string[] = [];
    beats.forEach((chord) => {
      if (chord && uniqueInOrder[uniqueInOrder.length - 1] !== chord) uniqueInOrder.push(chord);
    });
    if (uniqueInOrder.length > 0) measures.push(uniqueInOrder.join(' '));
  }

  return measures;
}

// 저장은 8마디 기본 패턴만 하고(서승기 백엔드와 합의), 실제 재생 시 이 8마디를 몇 번 반복해야
// mp3 재생 시간(playtimeSec)을 채우는지 계산. 오디오 파일이 없으면 기본값(4회)을 반환.
export function calculateRepeatCount(
  playtimeSec: number | undefined,
  bpm: number,
  timeSignature: string,
  measureCount = MEASURE_COUNT,
): number {
  if (!playtimeSec) return DEFAULT_REPEAT_COUNT;
  const secPerMeasure = (getChordsPerMeasure(timeSignature) * 60) / bpm;
  const loopDurationSec = measureCount * secPerMeasure;
  return Math.max(1, Math.round(playtimeSec / loopDurationSec));
}

function createEmptyMeasure(timeSignature: string): string[] {
  return Array.from({ length: getChordsPerMeasure(timeSignature) }, () => '');
}

export function createInitialMeasures(timeSignature: string): string[][] {
  return Array.from({ length: MEASURE_COUNT }, () => createEmptyMeasure(timeSignature));
}

export function toEditableMeasures(chordProgression: ChordMeasure[]): string[][] {
  let previous = '';
  return chordProgression.map((measure) =>
    measure.map((chord) => {
      if (chord) previous = chord;
      return chord ?? previous;
    }),
  );
}

// 실제 백엔드 응답(measureNo/sequenceNo 좌표 목록) → 폼 그리드(string[][])
export function fromChordProgressionEntries(entries: BackingTrackChordEntry[], timeSignature: string): string[][] {
  const measures = createInitialMeasures(timeSignature);
  entries.forEach(({ measureNo, sequenceNo, chordName }) => {
    const row = measures[measureNo - 1];
    if (row && row[sequenceNo - 1] !== undefined) row[sequenceNo - 1] = chordName;
  });
  return measures;
}

// 폼 그리드(string[][]) → 실제 백엔드 요청(measureNo/sequenceNo 좌표 목록)
// cascade로 채워진 반복 칸은 제외하고, 실제로 선택(변경)된 지점만 전송 — 화면에 보이는 것과 동일하게
export function toChordProgressionEntries(measures: string[][]): BackingTrackChordEntry[] {
  const entries: BackingTrackChordEntry[] = [];
  getDisplayMeasures(measures).forEach((measure, measureIndex) => {
    measure.forEach((chordName, cellIndex) => {
      if (!chordName) return;
      entries.push({ measureNo: measureIndex + 1, sequenceNo: cellIndex + 1, chordName });
    });
  });
  return entries;
}

// 겹치는 칸 보존
export function resizeMeasures(measures: string[][], timeSignature: string): string[][] {
  const chordsPerMeasure = getChordsPerMeasure(timeSignature);
  return measures.map((measure) => Array.from({ length: chordsPerMeasure }, (_, i) => measure[i] ?? ''));
}

// 수정한 칸부터 이어지던 동일 코드 구간(다음 칸이 이전 값과 같을 때) 새 코드로 함께 갱신
export function applyChordCascade(measures: string[][], cell: ChordCell, newValue: string): string[][] {
  const next = measures.map((measure) => [...measure]);
  const oldValue = next[cell.measureIndex][cell.cellIndex];

  let measureIndex = cell.measureIndex;
  let cellIndex = cell.cellIndex;

  while (measureIndex < next.length && next[measureIndex][cellIndex] === oldValue) {
    next[measureIndex][cellIndex] = newValue;

    cellIndex += 1;
    if (cellIndex >= next[measureIndex].length) {
      measureIndex += 1;
      cellIndex = 0;
    }
  }

  return next;
}

// 같은 코드 연속되면 처음 칸에서만 보이도록 화면 표시에서 숨김
export function getDisplayMeasures(measures: string[][]): string[][] {
  let previous = '';
  return measures.map((measure) =>
    measure.map((chord) => {
      const isRepeat = chord !== '' && chord === previous;
      previous = chord;
      return isRepeat ? '' : chord;
    }),
  );
}
