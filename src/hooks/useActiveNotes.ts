// src/hooks/useActiveNotes.ts
// 현재 눌려있는 건반 목록 관리 훅
import { useCallback, useRef, useState } from 'react';
import { useMidi } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';

export function useActiveNotes(
  onNoteOn?: (note: number, velocity: number, time: number) => void,
  onNoteOff?: (note: number) => void, // 뗀 순간 (지속시간 측정 등)
  enabled: boolean = true, // false면 입력 무시 (하이라이트도 안 함)
) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const { inputId } = useSettingStore();
  const enabledRef = useRef(enabled); // MIDI 콜백에서 최신 값 참조
  enabledRef.current = enabled;

  const { inputs, error } = useMidi(
    (note, velocity, time) => {
      if (!enabledRef.current) return; // 비활성(정지) 중엔 입력 무시
      setActiveNotes((prev) => new Set(prev).add(note));
      onNoteOn?.(note, velocity, time);
    },
    (note) => {
      // note-off는 항상 처리 (눌려있던 음 해제 — stuck 방지)
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteOff?.(note);
    },
    inputId, // ← 선택된 기기만 입력받도록 전달
  );

  // 눌린 건반 표시 초기화 (정지/재개 시 stuck 상태 방지)
  const reset = useCallback(() => setActiveNotes(new Set()), []);

  return { activeNotes, inputs, error, reset };
}
