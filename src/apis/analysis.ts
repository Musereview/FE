import type { ApiResponse } from '@/types/api';
import type { AnalysisResponseData } from '@/types/analysis';
import { axiosInstance } from './axiosInstance';

// 분석 상세 조회 (알림에서 연주 상세로 이동할 때 playingId 확보용)
export async function analysisDetail(analysisId: number) {
  const { data } = await axiosInstance.get<ApiResponse<AnalysisResponseData>>(`/api/analyses/${analysisId}`);
  return data.data;
}
