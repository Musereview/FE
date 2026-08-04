// 연주 세션(POST /api/playings 응답) — 상세 모달에서 만들어져 설정/플레이 페이지로 전달된다
import { create } from 'zustand';
import type { BackingTrackDetail } from '@/types/track';

interface PlayingSessionState {
  playingId: number | null;
  backingTrack: BackingTrackDetail | null;
  setSession: (s: { playingId: number; backingTrack: BackingTrackDetail }) => void;
  clear: () => void;
}

export const usePlayingSessionStore = create<PlayingSessionState>((set) => ({
  playingId: null,
  backingTrack: null,
  setSession: ({ playingId, backingTrack }) => set({ playingId, backingTrack }),
  clear: () => set({ playingId: null, backingTrack: null }),
}));
