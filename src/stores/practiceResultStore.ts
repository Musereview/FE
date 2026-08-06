// 연습 연주 결과(녹음 + 레이턴시 보정값)를 분석 화면으로 전달하는 스토어
import { create } from 'zustand';

export interface PlayedNote {
  midi: number;
  velocity: number;
  onSec: number; // Tone.Transport 기준 눌린 시각(초) — 곡 박자에 정렬됨
  offSec: number | null; // 뗀 시각(초). null이면 끝까지 눌린 상태
}

interface PracticeResultState {
  trackId?: string;
  recording: PlayedNote[]; // 사용자 연주 녹음 (원본, 보정 전)
  latencyMs: number; // 레이턴시 보정값(ms) — 분석 시 각 노트 시각에서 빼서 보정
  audioBlob: Blob | null; // 녹음된 오디오(webm) — 분석 화면에서 API 없이 바로 재생하는 용도
  setResult: (r: { trackId?: string; recording: PlayedNote[]; latencyMs: number; audioBlob: Blob | null }) => void;
  clear: () => void;
}

export const usePracticeResultStore = create<PracticeResultState>((set) => ({
  trackId: undefined,
  recording: [],
  latencyMs: 0,
  audioBlob: null,
  setResult: ({ trackId, recording, latencyMs, audioBlob }) => set({ trackId, recording, latencyMs, audioBlob }),
  clear: () => set({ trackId: undefined, recording: [], latencyMs: 0, audioBlob: null }),
}));
