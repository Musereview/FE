// 연주 세션(POST /api/playings 응답) — 상세 모달에서 만들어져 설정/플레이 페이지로 전달된다
// sessionStorage에 persist해 새로고침에도 유지 (탭 닫으면 사라짐, 세션 API를 다시 호출하지 않음)
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BackingTrackDetail } from '@/types/track';

interface PlayingSessionState {
  playingId: number | null;
  backingTrack: BackingTrackDetail | null;
  isCompleted: boolean; // 저장까지 끝나 서버에서 COMPLETED된 세션인지 -> 재사용하면 저장 시 409
  setSession: (s: { playingId: number; backingTrack: BackingTrackDetail }) => void;
  markCompleted: () => void;
  clear: () => void;
}

export const usePlayingSessionStore = create<PlayingSessionState>()(
  persist(
    (set) => ({
      playingId: null,
      backingTrack: null,
      isCompleted: false,
      setSession: ({ playingId, backingTrack }) => set({ playingId, backingTrack, isCompleted: false }),
      markCompleted: () => set({ isCompleted: true }),
      clear: () => set({ playingId: null, backingTrack: null, isCompleted: false }),
    }),
    {
      name: 'playing-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
