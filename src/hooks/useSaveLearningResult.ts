// 학습 결과 저장 mutation — 학습 종료(채점 완료) 시점에 호출
import { useMutation } from '@tanstack/react-query';
import { saveLearningResult } from '@/apis/learning';
import type { SaveLearningResultRequest } from '@/types/learning';

export const useSaveLearningResult = () =>
  useMutation({
    mutationFn: ({ learningId, body }: { learningId: number; body: SaveLearningResultRequest }) =>
      saveLearningResult(learningId, body),
  });
