import { create } from 'zustand';

// 레이턴시를 영구 저장하지 않기로 되돌리기 전(persist 적용 배포 ~ 되돌리기 전) 브라우저에 이미 저장된
// practice-settings 값이 남아있으면 이전 레이턴시가 계속 재사용된다 — 이번 배포에서 한 번 정리한다.
try {
  localStorage.removeItem('practice-settings');
} catch {
  // localStorage 접근 불가 환경(프라이빗 모드 등)은 애초에 값도 저장 안 됐으므로 무시
}

interface SettingsState {
  inputId: string | null;
  outputSelected: boolean; // ← 추가
  bpm: number;
  beatsPerBar: number;
  keyCount: 88 | 61;
  latencyByDevice: Record<string, number | 'failed'>; // 기기 id → 레이턴시(ms)
  setInput: (id: string) => void;
  setOutputSelected: (v: boolean) => void;
  setBpm: (bpm: number) => void;
  setBeatsPerBar: (n: number) => void;
  setKeyCount: (k: 88 | 61) => void;
  setLatency: (deviceId: string, ms: number | 'failed') => void;
  clearLatency: (deviceId: string) => void;
}

export const useSettingStore = create<SettingsState>((set) => ({
  inputId: null,
  outputSelected: false,
  bpm: 120,
  beatsPerBar: 4,
  keyCount: 88,
  latencyByDevice: {},
  setInput: (inputId) => set({ inputId }),
  setOutputSelected: (outputSelected) => set({ outputSelected }),
  setBpm: (bpm) => set({ bpm }),
  setBeatsPerBar: (beatsPerBar) => set({ beatsPerBar }),
  setKeyCount: (keyCount) => set({ keyCount }),
  setLatency: (deviceId, ms) =>
    set((state) => ({
      latencyByDevice: { ...state.latencyByDevice, [deviceId]: ms },
    })),
  clearLatency: (deviceId) =>
    // 레이턴시 삭제
    set((state) => {
      const next = { ...state.latencyByDevice };
      delete next[deviceId];
      return { latencyByDevice: next };
    }),
}));
