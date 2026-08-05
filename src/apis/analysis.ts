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
    // 공통 껍질(ApiResponse)을 까고 내부 알맹이(analysisId, status 등)만 리턴
    return response.data.data;
  } catch (error) {
    console.warn('분석 요청 생성 서버 통신 실패: Mock 데이터를 반환합니다.', error);
    // 서버가 미완성일 때를 대비한 Fallback Mock 데이터
    return {
      analysisId: 999,
      playingId: requestData.playingId,
      status: 'PENDING' as const,
      startBar: requestData.startBar,
      endBar: requestData.endBar,
      createdAt: new Date().toISOString(),
    };
  }
};

/**
 * 2. 분석 처리 상태 확인 (폴링) API (GET /api/analyses/{analysisId}/status)
 * - 로딩 화면에서 주기적으로 호출하여 진행률(progressRate)과 상태(status)를 확인합니다.
 */
export const checkAnalysisStatus = async (analysisId: number) => {
  try {
    const response = await axiosInstance.get<AnalysisStatusResponse>(`/api/analyses/${analysisId}/status`);
    return response.data.data; // analysisId, status, progressRate, message 등 알맹이 리턴
  } catch (error) {
    console.warn('분석 상태 조회 실패: Mock 데이터를 반환합니다.', error);
    // 테스트용 완료 상태 Mock 데이터
    return {
      analysisId,
      status: 'COMPLETED' as const,
      progressRate: 100,
      message: '연습 결과 분석이 완료되었습니다.',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }
};

/**
 * 3. 분석 결과 상세 조회 API (GET /api/analyses/{analysisId})
 * - 분석 완료 후 결과 화면 또는 히스토리 상세에서 호출하며, 점수, 리포트(report), AI 원본 결과(result)를 반환합니다.
 */
export const getAnalysisDetail = async (analysisId: number) => {
  try {
    const response = await axiosInstance.get<AnalysisDetailResponse>(`/api/analyses/${analysisId}`);
    return response.data.data; // AnalysisDetailData 알맹이 리턴
  } catch (error) {
    console.error(' 분석 결과 상세 조회 실패:', error);
    throw error;
  }
};
