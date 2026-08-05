// 학습 단계별 조회 훅 — StepTheoryPage에서 사용
//
// TODO: 현재 라우트(/learn/curriculum/:curriculumId/theory)에 stepId가 없어서
// 항상 1단계(learningStepId=1)로 고정 조회함. 단계별 라우팅이 추가되면 stepId를 파라미터로 받도록 수정 필요.
import { useQuery } from '@tanstack/react-query';
import { getLearningStep } from '@/apis/learning';
import { retryExceptClientError } from '@/apis/learningMappers';
import { getLearningIds } from '@/utils/learningId';
import type { LearningStepDetailResponse } from '@/types/learning';

const DEFAULT_STEP_ID = 1;

export const useLearningStep = (curriculumId: string) => {
  const { learningId } = getLearningIds(curriculumId);

  return useQuery({
    queryKey: ['learningStep', learningId, DEFAULT_STEP_ID],
    queryFn: (): Promise<LearningStepDetailResponse> => getLearningStep(learningId, DEFAULT_STEP_ID),
    enabled: learningId > 0,
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
};
