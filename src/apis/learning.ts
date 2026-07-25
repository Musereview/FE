import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { LearningResultResponse, PracticeDataResponse, SaveLearningResultRequest } from '@/types/learning';

// 학습 결과(점수) 저장 — POST /api/learnings/{learningId}/result
export async function saveLearningResult(
  learningId: number,
  body: SaveLearningResultRequest,
): Promise<LearningResultResponse> {
  const { data } = await axiosInstance.post<ApiResponse<LearningResultResponse>>(
    `/api/learnings/${learningId}/result`,
    body,
  );
  return data.data;
}

// 단계별 학습 연주(실습) 데이터 조회 — GET /api/learnings/{learningId}/steps/{learningStepId}/practice-data
// '이 이론으로 실습하기' 진입 시 호출. bpm/keySignature/midiData 반환.
export async function getPracticeData(learningId: number, learningStepId: number): Promise<PracticeDataResponse> {
  const { data } = await axiosInstance.get<ApiResponse<PracticeDataResponse>>(
    `/api/learnings/${learningId}/steps/${learningStepId}/practice-data`,
  );
  return data.data;
}

// TODO(mock): 백엔드 연동 전 임시 데이터. 연동 시 usePracticeData의 queryFn을 getPracticeData로 교체하면 됨.
// params는 실제 API 시그니처를 맞추기 위해 받되, mock에선 사용하지 않음.
export async function getPracticeDataMock(learningId: number, learningStepId: number): Promise<PracticeDataResponse> {
  void learningId;
  void learningStepId;
  return { bpm: 90, keySignature: 'C', midiData: '{}' };
}
