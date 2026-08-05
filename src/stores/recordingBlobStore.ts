// 연주 녹음 파일(webm Blob) 보관 — S3 업로드 전까지 메모리에만 유지
// Blob은 JSON으로 직렬화할 수 없어 sessionStorage persist 없이 순수 메모리 스토어로 둔다 (새로고침 시 사라짐)
import { create } from 'zustand';

interface RecordingBlobState {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob) => void;
  clear: () => void;
}

export const useRecordingBlobStore = create<RecordingBlobState>((set) => ({
  audioBlob: null,
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  clear: () => set({ audioBlob: null }),
}));
