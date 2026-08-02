import { useQuery } from '@tanstack/react-query';
import { historyDetail, historyList } from '@/apis/history';

export const HISTORY_LIST_QUERY_KEY = ['history', 'list'] as const;
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
