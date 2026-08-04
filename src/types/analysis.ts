// 분석 요청 Body 타입
export interface CreateAnalysisRequest {
  playingId: number;
  startBar: number;
  endBar: number;
}

// 분석 상태 Enum / Union 타입
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// 분석 응답 Data 타입
export interface AnalysisResponseData {
  analysisId: number;
  playingId: number;
  status: AnalysisStatus;
  startBar: number;
  endBar: number;
  createdAt: string;
}
