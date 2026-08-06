// 학습 진행률 조회 훅 — 학습 play 화면 헤더의 진행률 배지에 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningProgress } from '@/apis/learning';

export const useLearningProgress = (learningId: number) =>
  useQuery({
    queryKey: ['learningProgress', learningId],
    queryFn: () => getLearningProgress(learningId),
    enabled: learningId > 0,
  });
