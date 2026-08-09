// 프론트 curriculumId(문자열, 예: 'chapter-1') → API용 숫자 id (learningId=패키지, learningStepId=단계)
// 숫자를 못 찾으면 0을 반환 — 호출부의 enabled: learningId > 0 가드가 잘못된 id로 조회하는 것을 막음
export function getLearningIds(curriculumId: string): { learningId: number; learningStepId: number } {
  const n = Number(curriculumId.match(/\d+/)?.[0]);
  return { learningId: Number.isFinite(n) && n > 0 ? n : 0, learningStepId: 1 };
}

// 라우트 :stepId(문자열) → 검증된 양의 정수. 소수/Infinity/음수 등 잘못된 값은 0을 반환해
// enabled: stepId > 0 가드가 API 호출을 막도록 함
export function parseStepId(stepId: string): number {
  const n = Number(stepId);
  return Number.isInteger(n) && n > 0 ? n : 0;
}
