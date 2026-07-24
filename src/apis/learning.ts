import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { LearningResultResponse, SaveLearningResultRequest } from '@/types/learning';

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
