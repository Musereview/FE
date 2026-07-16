import type { ChordMeasure } from '@/types/track';
import type { ChordCell } from './ChordProgressionGrid';

const MEASURE_COUNT = 8;

export function getChordsPerMeasure(timeSignature: string) {
  return Number(timeSignature.split('/')[0]) || 4;
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
