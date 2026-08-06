import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisDetailData,
  AnalysisStatusData,
} from '@/types/analysis';

// 1. 분석 요청 생성 API
export async function requestAnalysis(requestData: CreateAnalysisRequest): Promise<CreateAnalysisResponse> {
  const { data } = await axiosInstance.post<ApiResponse<CreateAnalysisResponse>>('/api/analyses', requestData);
  return data.data;
}

// 2. 분석 처리 상태 확인 (폴링) API
export async function checkAnalysisStatus(analysisId: number): Promise<AnalysisStatusData> {
  const { data } = await axiosInstance.get<ApiResponse<AnalysisStatusData>>(`/api/analyses/${analysisId}/status`);
  return data.data;
}

// 3. 분석 결과 상세 조회 API
export async function getAnalysisDetail(analysisId: number): Promise<AnalysisDetailData> {
  const { data } = await axiosInstance.get<ApiResponse<AnalysisDetailData>>(`/api/analyses/${analysisId}`);
  return data.data;
}
