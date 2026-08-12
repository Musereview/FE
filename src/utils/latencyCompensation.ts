// 입력 레이턴시 보정
import type { PlayedNote } from '@/stores/practiceResultStore';

export function applyLatencyCompensation(recording: PlayedNote[], latencyMs: number): PlayedNote[] {
  if (!latencyMs) return recording;
  const offsetSec = latencyMs / 1000;
  return recording.map((note) => ({
    ...note,
    onSec: Math.max(0, note.onSec - offsetSec),
    offSec: note.offSec !== null ? Math.max(0, note.offSec - offsetSec) : null,
  }));
}
