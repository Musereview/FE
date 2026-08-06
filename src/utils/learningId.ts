// 프론트 curriculumId(문자열, 예: 'chapter-1') → API용 숫자 id (learningId=패키지, learningStepId=단계)
// 숫자를 못 찾으면 0을 반환 — 호출부의 enabled: learningId > 0 가드가 잘못된 id로 조회하는 것을 막음
export function getLearningIds(curriculumId: string): { learningId: number; learningStepId: number } {
  const n = Number(curriculumId.match(/\d+/)?.[0]);
  return { learningId: Number.isFinite(n) && n > 0 ? n : 0, learningStepId: 1 };
}
