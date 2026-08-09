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

// 히스토리 상세보기 조회
// 응답의 recordingFileUrl은 만료가 있는 presigned URL이라 캐시를 오래 들고 있으면 안 된다.
// staleTime은 요청을 예약하지 않으므로 기본값(0)으로 두어 마운트/포커스마다 새로 받고,
// 실제 만료는 재생·로드 실패 시 refetch로 복구한다.
export function useHistoryDetail(playingId: number) {
  return useQuery({
    queryKey: historyDetailQueryKey(playingId),
    queryFn: () => historyDetail(playingId),
    enabled: playingId >= 1,
    retry: retryExceptClientError,
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
