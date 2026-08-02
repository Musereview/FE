import type { ApiResponse } from './api';

export interface HistoryItem {
  playingId: number;
  latestAnalysisId: number;
  title: string;
  summary: string;
  scoreChange: number;
  durationMinutes: number;
  durationSec: number;
  playedAt: string;
  relativeDate: string;
}

export interface HistoryData {
  page: number;
  size: number;
  haseNext: boolean;
  items: HistoryItem[];
}

export type HistoryResponse = ApiResponse<HistoryData>;
