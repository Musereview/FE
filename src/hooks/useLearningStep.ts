// 학습 단계별 조회 훅 — StepTheoryPage/StepLearningSettingsPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningStep } from '@/apis/learning';
import { retryExceptClientError } from '@/apis/learningMappers';
import { getLearningIds } from '@/utils/learningId';
import type { LearningStepDetailResponse } from '@/types/learning';

export const useLearningStep = (curriculumId: string, stepId: string) => {
  const { learningId } = getLearningIds(curriculumId);
  const learningStepId = Number(stepId);

  return useQuery({
    queryKey: ['learningStep', learningId, learningStepId],
    queryFn: (): Promise<LearningStepDetailResponse> => getLearningStep(learningId, learningStepId),
    enabled: learningId > 0 && learningStepId > 0,
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
};
