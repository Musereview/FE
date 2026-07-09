const INITIAL_MEASURE_COUNT = 8;
// "+" 클릭 시 한 줄(행)씩 추가 — 한 행은 2마디로 구성.
const ADD_MEASURE_COUNT = 2;

function getChordsPerMeasure(timeSignature: string) {
  return Number(timeSignature.split('/')[0]) || 4;
}

function createEmptyMeasure(timeSignature: string): string[] {
  return Array.from({ length: getChordsPerMeasure(timeSignature) }, () => '');
}

export function createInitialMeasures(timeSignature: string): string[][] {
  return Array.from({ length: INITIAL_MEASURE_COUNT }, () => createEmptyMeasure(timeSignature));
}

export function addMeasures(measures: string[][], timeSignature: string): string[][] {
  const newMeasures = Array.from({ length: ADD_MEASURE_COUNT }, () => createEmptyMeasure(timeSignature));
  return [...measures, ...newMeasures];
}
