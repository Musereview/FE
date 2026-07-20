// src/hooks/useActiveNotes.ts
// 현재 눌려있는 건반 목록 관리 훅
import { useState } from 'react';
import { useMidi } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';

export function useActiveNotes(onNoteOn?: (note: number, velocity: number, time: number) => void) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const { inputId } = useSettingStore();

  const { inputs, error } = useMidi(
    (note, velocity, time) => {
      setActiveNotes((prev) => new Set(prev).add(note));
      onNoteOn?.(note, velocity, time);
    },
    (note) =>
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      }),
    inputId, // ← 선택된 기기만 입력받도록 전달
  );

  return { activeNotes, inputs, error };
}
