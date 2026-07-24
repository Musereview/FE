// 학습 결과 저장 API 타입

// 요청 바디 — POST /api/learnings/{learningId}/result
export interface SaveLearningResultRequest {
  score: number; // 최종 점수
  learningStep: number; // 학습 스텝 번호
}

// 응답 data
export interface LearningResultResponse {
  userLearningProgressId: number;
  userId: number;
  learningId: number;
  status: string; // 예: 'COMPLETED'
  score: number;
  completedAt: string; // ISO 8601
}
