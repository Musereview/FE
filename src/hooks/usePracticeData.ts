// 단계별 학습 연주(실습) 데이터 조회 훅 — '이 이론으로 실습하기' 진입 시 사용
import { useQuery } from '@tanstack/react-query';
import { getPracticeData } from '@/apis/learning';

export const usePracticeData = (learningId: number, learningStepId: number) =>
  useQuery({
    queryKey: ['practiceData', learningId, learningStepId],
    queryFn: () => getPracticeData(learningId, learningStepId),
    enabled: learningId > 0 && learningStepId > 0,
    staleTime: Infinity,
  });
