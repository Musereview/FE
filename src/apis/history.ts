import type { HistoryDetailResponse, HistoryListResponse, HistoryStatisticsResponse } from '@/types/history';
import { axiosInstance } from './axiosInstance';

// 히스토리 목록 조회
export async function historyList() {
  const { data } = await axiosInstance.get<HistoryListResponse>('/api/histories');
  return data.data;
}

// 히스토리 상세보기 조회
export async function historyDetail(playingId: number) {
  const { data } = await axiosInstance.get<HistoryDetailResponse>(`/api/histories/${playingId}`);
  return data.data;
}

// 히스토리 통계 조회
export async function historyStatistics() {
  const { data } = await axiosInstance.get<HistoryStatisticsResponse>('/api/users/me/statistics');
  return data.data;
}
