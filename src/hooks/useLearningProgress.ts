// 학습 진행률 조회 훅 — 학습 play 화면 헤더의 진행률 배지에 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningProgress } from '@/apis/learning';
import { getAccessToken } from '@/utils/authStorage';

export const useLearningProgress = (learningId: number) =>
  useQuery({
    // 사용자별 진행률 캐시이므로 계정 전환 시 섞이지 않도록 토큰을 키에 포함
    queryKey: ['learningProgress', learningId, getAccessToken()],
    queryFn: () => getLearningProgress(learningId),
    enabled: learningId > 0,
  });
