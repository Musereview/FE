import type { HistoryResponse } from '@/types/history';
import { axiosInstance } from './axiosInstance';

// 히스토리 목록 조회
export async function historyList() {
  const { data } = await axiosInstance.get<HistoryResponse>('/api/histories');
  return data.data;
}
