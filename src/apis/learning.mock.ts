// 학습 실습(practice-data) 관련 임시 mock — 해당 API(민서 담당) 백엔드 연동되면 이 파일 삭제.
import type { PracticeDataResponse } from '@/types/learning';

// practice-data 임시 응답 — 실제 getPracticeData(learningId, learningStepId)와 시그니처 동일
export async function getPracticeDataMock(learningId: number, learningStepId: number): Promise<PracticeDataResponse> {
  void learningId;
  void learningStepId;
  return { bpm: 120, keySignature: 'C', midiData: '{}' };
}
