import { create } from 'zustand';

interface SettingsState {
  inputId: string | null;
  bpm: number;
  keyCount: 88 | 61;
  latencyMs: number | null;
  setInput: (id: string) => void;
  setBpm: (bpm: number) => void;
  setKeyCount: (k: 88 | 61) => void;
  setLatency: (ms: number) => void;
}

export const useSettingStore = create<SettingsState>((set) => ({
  inputId: null,
  bpm: 120,
  keyCount: 88,
  latencyMs: null,
  setInput: (inputId) => set({ inputId }),
  setBpm: (bpm) => set({ bpm }),
  setKeyCount: (keyCount) => set({ keyCount }),
  setLatency: (latencyMs) => set({ latencyMs }),
}));
