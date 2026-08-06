// 실전 반주법 전체 조회 훅 — TopicDetailPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getAccompanimentList } from '@/apis/learning';
import { derivePackageStatus, formatEstimatedMinutes, retryExceptClientError } from '@/apis/learningMappers';
import { getAccessToken } from '@/utils/authStorage';
import type { TopicChapter } from '@/types/topic';

export const useAccompanimentList = () =>
  useQuery({
    // progressRate가 사용자별 데이터라 계정 전환 시 캐시가 섞이지 않도록 토큰을 키에 포함
    queryKey: ['accompanimentList', getAccessToken()],
    queryFn: async (): Promise<TopicChapter[]> => {
      const { items } = await getAccompanimentList();
      return items.map((item) => ({
        id: String(item.learningId),
        title: item.title,
        description: item.description,
        durationLabel: formatEstimatedMinutes(item.estimatedMinutes),
        status: derivePackageStatus(item.progressRate),
      }));
    },
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
