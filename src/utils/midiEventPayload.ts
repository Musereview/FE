// PlayedNote[](캔버스 모델)를 MIDI 이벤트 저장 API 요청 바디로 변환한다.
// 판단 로직 없이 모양만 바꾸는 직렬화 전용 변환 — API 연동 시 전송 직전에만 호출한다.
import type { PlayedNote } from '@/stores/practiceResultStore';

export interface MidiEventPayload {
  sequence: number;
  type: 'NOTE_ON' | 'NOTE_OFF';
  pitch: number;
  velocity: number;
  timestampMs: number;
}

export function toMidiEventPayload(recording: PlayedNote[]): MidiEventPayload[] {
  const events: Omit<MidiEventPayload, 'sequence'>[] = [];

  for (const note of recording) {
    events.push({ type: 'NOTE_ON', pitch: note.midi, velocity: note.velocity, timestampMs: note.onSec * 1000 });
    if (note.offSec !== null) {
      events.push({ type: 'NOTE_OFF', pitch: note.midi, velocity: 0, timestampMs: note.offSec * 1000 });
    }
  }

  events.sort((a, b) => a.timestampMs - b.timestampMs);

  return events.map((e, i) => ({ ...e, sequence: i }));
}
