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
export type MidiEventType = 'NOTE_ON' | 'NOTE_OFF';

export interface MidiEventsData {
  sequence: number;
  type: MidiEventType;
  pitch: number;
  velocity: number;
  timestampMs: number;
}

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface HistoryAnalysisItem {
  analysisId: number;
  startBar: number;
  endBar: number;
  title: string;
  oneLineSummary: string;
  status: AnalysisStatus;
  estimatedSeconds: number | null;
  createdAt: string;
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
  backingTrackMidiData: Record<string, unknown>;
  totalBars: number | null;
  analyses: HistoryAnalysisItem[];
}

export type HistoryDetailResponse = ApiResponse<HistoryDetailData>;
