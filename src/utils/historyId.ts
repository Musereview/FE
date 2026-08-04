// 연주 히스토리 ID는 1 이상의 정수만 유효
export function isValidHistoryId(id: unknown): id is number {
  return typeof id === 'number' && Number.isSafeInteger(id) && id >= 1;
}
