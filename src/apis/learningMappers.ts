// 학습 API 응답을 프론트 도메인 타입/표시값으로 변환하는 공용 헬퍼
import { isAxiosError } from 'axios';
import type { ChapterStatus, TopicDifficulty } from '@/types/topic';

// 백엔드: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' → 프론트: 'beginner' | 'intermediate' | 'advanced'
export function mapDifficulty(apiDifficulty: string): TopicDifficulty {
  return apiDifficulty.toLowerCase() as TopicDifficulty;
}

// 프론트 → 백엔드 (GET /api/learnings/theory?difficulty= 쿼리 파라미터용)
export function toApiDifficulty(difficulty: TopicDifficulty): string {
  return difficulty.toUpperCase();
}

// 백엔드 단계 상태: 'NOT_STARTED' | 'RETRY' | 'COMPLETED'
// 프론트 ChapterStatus는 'learning'(학습 중) 상태도 갖지만, 백엔드엔 대응하는 값이 없음 — 확인 필요 항목
const STEP_STATUS_MAP: Record<string, ChapterStatus> = {
  NOT_STARTED: 'ready',
  RETRY: 'retry',
  COMPLETED: 'completed',
};

export function mapStepStatus(apiStatus: string): ChapterStatus {
  return STEP_STATUS_MAP[apiStatus] ?? 'ready';
}

// 실전 반주법 패키지는 status 없이 progressRate만 내려옴 — 진행률로 상태 계산
export function derivePackageStatus(progressRate: number): ChapterStatus {
  if (progressRate <= 0) return 'ready';
  if (progressRate >= 100) return 'completed';
  return 'learning';
}

export function formatEstimatedMinutes(minutes: number): string {
  return `소요시간 ${minutes}분`;
}

// 4xx(예: 401 미인증)는 재시도해도 결과가 같으므로 재시도하지 않음
export function retryExceptClientError(failureCount: number, error: Error): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 3;
}
