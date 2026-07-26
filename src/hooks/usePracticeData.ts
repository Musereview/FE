// 단계별 학습 연주(실습) 데이터 조회 훅 — '이 이론으로 실습하기' 진입 시 사용
// 지금은 mock. 백엔드 연동 시 queryFn을 getPracticeData로 한 줄만 교체하면 됨.
import { useQuery } from '@tanstack/react-query';
import { getPracticeDataMock } from '@/apis/learning.mock';

export const usePracticeData = (learningId: number, learningStepId: number) =>
  useQuery({
    queryKey: ['practiceData', learningId, learningStepId],
    // TODO: 백엔드 연동 시 → getPracticeData(learningId, learningStepId)
    queryFn: () => getPracticeDataMock(learningId, learningStepId),
    enabled: learningId > 0 && learningStepId > 0,
    staleTime: Infinity,
  });
