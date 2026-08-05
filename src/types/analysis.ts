// src/types/analysis.ts
import type { ApiResponse } from './api';

// 분석 상태 Union 타입
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// 평가 등급 Union 타입
export type AnalysisGrade = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

// 1. [POST /api/analyses] 분석 요청 생성
export interface CreateAnalysisRequest {
  playingId: number;
  startBar: number;
  endBar: number;
}

export interface CreateAnalysisData {
  analysisId: number;
  playingId: number;
  status: AnalysisStatus;
  startBar: number;
  endBar: number;
  createdAt: string;
}

export type CreateAnalysisResponse = ApiResponse<CreateAnalysisData>;

// 2. [GET /api/analyses/{analysisId}/status] 분석 상태 조회
export interface AnalysisStatusData {
  analysisId: number;
  status: AnalysisStatus;
  progressRate: number | null;
  message: string;
  createdAt: string;
  completedAt: string | null;
}

export type AnalysisStatusResponse = ApiResponse<AnalysisStatusData>;

// 3. [GET /api/analyses/{analysisId}] 분석 결과 상세 조회
export interface AnalysisReport {
  analysisReportId: number;
  generationType: 'LLM' | 'RULE_BASED';
  llmStatus: string;
  contentFormat: 'MARKDOWN' | string;
  content: string;
  modelName: string | null;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRecommendation {
  topic: string;
  title: string;
  category: string;
  priority: number;
  reason: string;
  description: string;
  study_tip: string;
}

export interface AnalysisResultData {
  meta: {
    bpm: number;
    time_signature: number[];
    key: string;
    genre: string;
  };
  scores: {
    axes: {
      coherence: number;
      voice_leading: number;
      vocabulary: number;
      consistency: number;
    };
    domains: {
      스케일: number;
      텐션: number;
      진행: number;
      '코드 연결': number;
    };
    final_score: number;
    grade: string;
  };
  timing_deviations: {
    summary: {
      mean_ms: number;
      tendency: string;
      flagged_count: number;
    };
    notes: Array<unknown>; // 필요 시 구체적 노트 오차 타입으로 확장 가능
  };
  learning_recommendations: LearningRecommendation[];
}

export interface AnalysisDetailData {
  analysisId: number;
  playingId: number;
  title: string;
  genre: string | null;
  key: string | null;
  bpm: number;
  playedAt: string;
  status: AnalysisStatus;
  startBar: number;
  endBar: number;
  totalScore: number;
  grade: AnalysisGrade;
  summary: string;
  domainScores: {
    scale: number;
    tension: number;
    progression: number;
    voiceLeading: number;
  };
  report: AnalysisReport;
  result: AnalysisResultData;
  createdAt: string;
  completedAt: string;
}

export type AnalysisDetailResponse = ApiResponse<AnalysisDetailData>;
