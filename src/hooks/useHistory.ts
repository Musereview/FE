import { useQuery } from '@tanstack/react-query';
import { historyList } from '@/apis/history';

export const HISTORY_LIST_QUERY_KEY = ['history', 'list'] as const;

// 히스토리 목록 조회
export function useHistoryList() {
  return useQuery({
    queryKey: HISTORY_LIST_QUERY_KEY,
    queryFn: () => historyList(),
  });
}
