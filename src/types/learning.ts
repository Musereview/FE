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

// 연주(실습) 데이터 조회 응답 data
// GET /api/learnings/{learningId}/steps/{learningStepId}/practice-data
// 단계 상세 화면엔 없는, 실제 연주·채점에 필요한 값만 반환
export interface PracticeDataResponse {
  bpm: number;
  keySignature: string; // 예: 'C'
  midiData: string; // 채점용 MIDI 데이터 (JSON 문자열)
}
