// 프론트 curriculumId(문자열, 예: 'chapter-1') → API용 숫자 id (learningId=패키지, learningStepId=단계)
export function getLearningIds(curriculumId: string): { learningId: number; learningStepId: number } {
  const n = Number(curriculumId.match(/\d+/)?.[0]);
  return { learningId: Number.isFinite(n) && n > 0 ? n : 1, learningStepId: 1 };
}
