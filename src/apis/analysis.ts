import { axiosInstance } from './axiosInstance';
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisStatusResponse,
  AnalysisDetailResponse,
} from '@/types/analysis';

/**
 * 1. 분석 요청 생성 API (POST /api/analyses)
 * - 연주 ID와 시작/끝 마디를 전달하여 새로운 AI 분석을 요청합니다.
 */
export const requestAnalysis = async (requestData: CreateAnalysisRequest) => {
  try {
    const response = await axiosInstance.post<CreateAnalysisResponse>('/api/analyses', requestData);

    return response.data.data;
  } catch (error) {
    console.warn('분석 요청 생성 서버 통신 실패: Mock 데이터를 반환합니다.', error);
    throw error;
  }
};

/**
 * 2. 분석 처리 상태 확인 (폴링) API (GET /api/analyses/{analysisId}/status)
 */
export const checkAnalysisStatus = async (analysisId: number) => {
  try {
    const response = await axiosInstance.get<AnalysisStatusResponse>(`/api/analyses/${analysisId}/status`);
    return response.data.data;
  } catch (error) {
    console.warn('분석 상태 조회 실패: Mock 데이터를 반환합니다.', error);
    throw error;
  }
};

/**
 * 3. 분석 결과 상세 조회 API (GET /api/analyses/{analysisId})
 */
export const getAnalysisDetail = async (analysisId: number) => {
  try {
    const response = await axiosInstance.get<AnalysisDetailResponse>(`/api/analyses/${analysisId}`);
    return response.data.data;
  } catch (error) {
    console.error('분석 결과 상세 조회 실패:', error);
    throw error;
  }
};
