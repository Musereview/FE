// 학습 주제 전체 조회 훅 — TopicListPage에서 사용. difficulty별로 서버에 다시 요청함(필수 쿼리 파라미터).
import { useQuery } from '@tanstack/react-query';
import { getTheoryTopics } from '@/apis/learning';
import { mapDifficulty, retryExceptClientError } from '@/apis/learningMappers';
import type { Topic, TopicDifficulty } from '@/types/topic';

export const useTheoryTopics = (difficulty: TopicDifficulty) =>
  useQuery({
    queryKey: ['theoryTopics', difficulty],
    queryFn: async (): Promise<Topic[]> => {
      const { items } = await getTheoryTopics(difficulty);
      return items.map((item) => ({
        id: String(item.learningId),
        title: item.title,
        difficulty: mapDifficulty(item.difficulty),
        description: item.summary,
      }));
    },
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
