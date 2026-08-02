import type { ApiResponse } from './api';

// 히스토리 목록 조회
export interface HistoryListItem {
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

export interface HistoryListData {
  page: number;
  size: number;
  hasNext: boolean;
  items: HistoryListItem[];
}

export type HistoryListResponse = ApiResponse<HistoryListData>;

// 히스토리 상세보기 조회
export interface MidiEventsData {
  sequence: number;
  type: string;
  pitch: number;
  velocity: number;
  timestampMs: number;
}

export interface HistoryDetailData {
  playingId: number;
  title: string;
  genre: string;
  key: string;
  bpm: number;
  timeSignature: string;
  playedAt: string;
  durationMinutes: number;
  durationSec: number;
  midiEvents: MidiEventsData[];
}

export type HistoryDetailResponse = ApiResponse<HistoryDetailData>;
