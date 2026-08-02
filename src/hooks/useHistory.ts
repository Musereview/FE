import { useQuery } from '@tanstack/react-query';
import { historyDetail, historyList, historyStatistics } from '@/apis/history';

export const HISTORY_LIST_QUERY_KEY = ['history', 'list'] as const;
export const HISTORY_STATISTICS_QUERY_KEY = ['history', 'statistics'] as const;
export const historyDetailQueryKey = (playingId: number) => ['history', 'detail', playingId] as const;

// 히스토리 목록 조회
export function useHistoryList() {
  return useQuery({
    queryKey: HISTORY_LIST_QUERY_KEY,
    queryFn: () => historyList(),
  });
}

// 히스토리 상세보기 조회
export function useHistoryDetail(playingId: number) {
  return useQuery({
    queryKey: historyDetailQueryKey(playingId),
    queryFn: () => historyDetail(playingId),
    enabled: playingId >= 1,
  });
}

// 히스토리 통계 조회
export function useHistoryStatistics() {
  return useQuery({
    queryKey: HISTORY_STATISTICS_QUERY_KEY,
    queryFn: () => historyStatistics(),
  });
}
