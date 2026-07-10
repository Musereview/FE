import { create } from 'zustand';

interface SettingsState {
  inputId: string | null;
  bpm: number;
  keyCount: 88 | 61;
  latencyByDevice: Record<string, number>; // 기기 id → 레이턴시(ms)
  setInput: (id: string) => void;
  setBpm: (bpm: number) => void;
  setKeyCount: (k: 88 | 61) => void;
  setLatency: (deviceId: string, ms: number) => void;
}

export const useSettingStore = create<SettingsState>((set) => ({
  inputId: null,
  bpm: 120,
  keyCount: 88,
  latencyByDevice: {},
  setInput: (inputId) => set({ inputId }),
  setBpm: (bpm) => set({ bpm }),
  setKeyCount: (keyCount) => set({ keyCount }),
  setLatency: (deviceId, ms) =>
    set((state) => ({
      latencyByDevice: { ...state.latencyByDevice, [deviceId]: ms },
    })),
}));
