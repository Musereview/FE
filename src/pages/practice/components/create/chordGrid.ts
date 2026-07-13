import type { ChordMeasure } from '@/types/track';
import type { ChordCell } from './ChordProgressionGrid';

const MEASURE_COUNT = 8;

function getChordsPerMeasure(timeSignature: string) {
  return Number(timeSignature.split('/')[0]) || 4;
}

function createEmptyMeasure(timeSignature: string): string[] {
  return Array.from({ length: getChordsPerMeasure(timeSignature) }, () => '');
}

export function createInitialMeasures(timeSignature: string): string[][] {
  return Array.from({ length: MEASURE_COUNT }, () => createEmptyMeasure(timeSignature));
}

export function toEditableMeasures(chordProgression: ChordMeasure[]): string[][] {
  return chordProgression.map((measure) => measure.map((chord) => chord ?? ''));
}

// 겹치는 칸 보존 (4/4→3/4: 4번 삭제, 3/4→4/4: 4번 빈칸 추가)
export function resizeMeasures(measures: string[][], timeSignature: string): string[][] {
  const chordsPerMeasure = getChordsPerMeasure(timeSignature);
  return measures.map((measure) => Array.from({ length: chordsPerMeasure }, (_, i) => measure[i] ?? ''));
}

// 빈 칸 = 직전 코드 유지. 빈 칸 클릭 시 앞쪽 코드 칸으로 위임
export function resolveOwningCell(measures: string[][], cell: ChordCell): ChordCell {
  if (measures[cell.measureIndex]?.[cell.cellIndex]) return cell;

  for (let measureIndex = cell.measureIndex; measureIndex >= 0; measureIndex -= 1) {
    const startCellIndex = measureIndex === cell.measureIndex ? cell.cellIndex : measures[measureIndex].length - 1;
    for (let cellIndex = startCellIndex; cellIndex >= 0; cellIndex -= 1) {
      if (measures[measureIndex][cellIndex]) return { measureIndex, cellIndex };
    }
  }

  return cell;
}
