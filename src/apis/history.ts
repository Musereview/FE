import type { HistoryListResponse } from '@/types/history';
import { axiosInstance } from './axiosInstance';

// 히스토리 목록 조회
export async function historyList() {
  const { data } = await axiosInstance.get<HistoryListResponse>('/api/histories');
  return data.data;
}
