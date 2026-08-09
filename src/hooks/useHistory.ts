import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { historyDetail, historyList, historyStatistics } from '@/apis/history';

function retryExceptClientError(failureCount: number, error: Error) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 3;
}

export const HISTORY_LIST_QUERY_KEY = ['history', 'list'] as const;
export const HISTORY_STATISTICS_QUERY_KEY = ['history', 'statistics'] as const;
export const historyDetailQueryKey = (playingId: number) => ['history', 'detail', playingId] as const;

// 히스토리 목록 조회
export function useHistoryList() {
  return useQuery({
    queryKey: HISTORY_LIST_QUERY_KEY,
    queryFn: () => historyList(),
    retry: retryExceptClientError,
  });
}

// 만료 전에 stale 처리해 새로 발급
const RECORDING_URL_STALE_TIME = 5 * 60 * 1000;

// 히스토리 상세보기 조회
export function useHistoryDetail(playingId: number) {
  return useQuery({
    queryKey: historyDetailQueryKey(playingId),
    queryFn: () => historyDetail(playingId),
    enabled: playingId >= 1,
    retry: retryExceptClientError,
    staleTime: RECORDING_URL_STALE_TIME,
  });
}

// 히스토리 통계 조회
export function useHistoryStatistics() {
  return useQuery({
    queryKey: HISTORY_STATISTICS_QUERY_KEY,
    queryFn: () => historyStatistics(),
    retry: retryExceptClientError,
  });
}
