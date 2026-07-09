// src/hooks/useActiveNotes.ts
// 현재 눌려있는 건반 목록 관리 훅
import { useState } from 'react';
import { useMidi } from '@/hooks/useMidi';

export function useActiveNotes() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  const { inputs, error } = useMidi(
    (note) => setActiveNotes((prev) => new Set(prev).add(note)),
    (note) =>
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      }),
  );

  return { activeNotes, inputs, error };
}
