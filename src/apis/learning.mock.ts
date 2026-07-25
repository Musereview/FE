// 학습 관련 임시 mock — 백엔드 연동되면 이 파일 통째로 삭제.
// (스왑 지점: usePracticeData의 queryFn을 getPracticeData로, 플레이 화면의 id는 실제 값으로)
import type { PracticeDataResponse } from '@/types/learning';

// practice-data 임시 응답 — 실제 getPracticeData(learningId, learningStepId)와 시그니처 동일
export async function getPracticeDataMock(learningId: number, learningStepId: number): Promise<PracticeDataResponse> {
  void learningId;
  void learningStepId;
  return { bpm: 120, keySignature: 'C', midiData: '{}' };
}

// 프론트 curriculumId(문자열) → practice-data API용 숫자 id (learningId=패키지, learningStepId=단계)
export function getLearningIds(curriculumId: string): { learningId: number; learningStepId: number } {
  const n = Number(curriculumId.match(/\d+/)?.[0]);
  return { learningId: Number.isFinite(n) && n > 0 ? n : 1, learningStepId: 1 };
}
