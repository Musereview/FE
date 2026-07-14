// src/hooks/useActiveNotes.ts
// 현재 눌려있는 건반 목록 관리 훅
import { useState } from 'react';
import { useMidi } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';

export function useActiveNotes() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const { inputId } = useSettingStore();

  const { inputs, error } = useMidi(
    (note) => setActiveNotes((prev) => new Set(prev).add(note)),
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
