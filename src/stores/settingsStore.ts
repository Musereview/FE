import { create } from 'zustand';

interface SettingsState {
  inputId: string | null;
  outputSelected: boolean; // ← 추가
  bpm: number;
  keyCount: 88 | 61;
  latencyByDevice: Record<string, number | 'failed'>; // 기기 id → 레이턴시(ms)
  setInput: (id: string) => void;
  setOutputSelected: (v: boolean) => void;
  setBpm: (bpm: number) => void;
  setKeyCount: (k: 88 | 61) => void;
  setLatency: (deviceId: string, ms: number | 'failed') => void;
  clearLatency: (deviceId: string) => void;
}

export const useSettingStore = create<SettingsState>((set) => ({
  inputId: null,
  outputSelected: false,
  bpm: 120,
  keyCount: 88,
  latencyByDevice: {},
  setInput: (inputId) => set({ inputId }),
  setOutputSelected: (outputSelected) => set({ outputSelected }),
  setBpm: (bpm) => set({ bpm }),
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
