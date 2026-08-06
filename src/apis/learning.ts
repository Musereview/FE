import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  AccompanimentListResponse,
  LearningCurriculumResponse,
  LearningHomeResponse,
  LearningResultResponse,
  LearningStepDetailResponse,
  PracticeDataResponse,
  SaveLearningResultRequest,
  TheoryListResponse,
} from '@/types/learning';
import type { TopicDifficulty } from '@/types/topic';
import { toApiDifficulty } from './learningMappers';

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

// 1. 학습 홈 조회 — GET /api/learnings/home
export async function getLearningHome(): Promise<LearningHomeResponse> {
  const { data } = await axiosInstance.get<ApiResponse<LearningHomeResponse>>('/api/learnings/home');
  return data.data;
}

// 2-1. 학습 주제 전체 조회 — GET /api/learnings/theory?difficulty=BEGINNER|INTERMEDIATE|ADVANCED (difficulty 필수)
export async function getTheoryTopics(difficulty: TopicDifficulty): Promise<TheoryListResponse> {
  const { data } = await axiosInstance.get<ApiResponse<TheoryListResponse>>('/api/learnings/theory', {
    params: { difficulty: toApiDifficulty(difficulty) },
  });
  return data.data;
}

// 2-2. 실전 반주법 전체 조회 — GET /api/learnings/accompaniment
export async function getAccompanimentList(): Promise<AccompanimentListResponse> {
  const { data } = await axiosInstance.get<ApiResponse<AccompanimentListResponse>>('/api/learnings/accompaniment');
  return data.data;
}

// 3. 학습 커리큘럼 조회 — GET /api/learnings/{learningId}
export async function getLearningCurriculum(learningId: number): Promise<LearningCurriculumResponse> {
  const { data } = await axiosInstance.get<ApiResponse<LearningCurriculumResponse>>(`/api/learnings/${learningId}`);
  return data.data;
}

// 4. 학습 단계별 조회 — GET /api/learnings/{learningId}/steps/{stepId}
export async function getLearningStep(learningId: number, stepId: number): Promise<LearningStepDetailResponse> {
  const { data } = await axiosInstance.get<ApiResponse<LearningStepDetailResponse>>(
    `/api/learnings/${learningId}/steps/${stepId}`,
  );
  return data.data;
}
