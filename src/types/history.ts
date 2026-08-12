import type { ApiResponse } from './api';

// 히스토리 목록 조회
export interface HistoryListItem {
  playingId: number;
  backingTrackId: number | null;
  latestAnalysisId: number | null;
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
  backingTrackId: number | null;
  title: string;
  genre: string;
  key: string;
  bpm: number;
  timeSignature: string;
  playedAt: string;
  durationMinutes: number;
  durationSec: number;
  recordingFileUrl: string | null; // 저장된 녹음 음원이 없으면 null
  backingTrackAudioFileUrl: string | null; // 백킹트랙 또는 음원이 없으면 null
  midiEvents: MidiEventsData[];
  backingTrackMidiData: Record<string, unknown> | null; // 백킹트랙이 없거나 midiData가 비면 null
  totalBars: number | null;
  analyses: HistoryAnalysisItem[];
}

export type HistoryDetailResponse = ApiResponse<HistoryDetailData>;

// 히스토리 통계 조회 (이번주 요약 / 영역별 성장 / 최근 4주 추이)
export interface WeeklySummary {
  accuracy: number;
  practiceMinutes: number;
  completedSessionCount: number;
  accuracyDiff: number;
  practiceMinutesDiff: number;
  completedSessionCountDiff: number;
}

export type GrowthDomain = 'SCALE' | 'TENSION' | 'PROGRESSION' | 'VOICE_LEADING';

export interface DomainGrowthItem {
  domain: GrowthDomain;
  label: string;
  currentScore: number;
  previousScore: number;
  diff: number;
}

export interface WeeklyTrendItem {
  label: string;
  averageScore: number;
}

export interface WeeklyTrendData {
  diffFromPreviousWeek: number;
  items: WeeklyTrendItem[];
}

export interface HistoryStatisticsData {
  weeklySummary: WeeklySummary;
  domainGrowth: DomainGrowthItem[];
  weeklyTrend: WeeklyTrendData;
}

export type HistoryStatisticsResponse = ApiResponse<HistoryStatisticsData>;
