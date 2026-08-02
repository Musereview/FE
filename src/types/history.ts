import type { ApiResponse } from './api';

export interface HistoryItem {
  playingId: number;
  latestAnalysisId: number;
  title: string;
  summary: string;
  scoreChange: number | null;
  durationMinutes: number;
  durationSec: number;
  playedAt: string;
  relativeDate: string;
}

export interface HistoryData {
  page: number;
  size: number;
  hasNext: boolean;
  items: HistoryItem[];
}

export type HistoryResponse = ApiResponse<HistoryData>;
