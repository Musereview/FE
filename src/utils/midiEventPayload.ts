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

// 서버가 내려준 MIDI 이벤트 목록을 PlayedNote[]로 되돌림
// NOTE_ON과 같은 pitch의 NOTE_OFF를 FIFO로 짝지어 닫고 짝을 못 찾은 노트는 offSec을 null로 남김
export function toPlayedNotes(events: MidiEventPayload[]): PlayedNote[] {
  const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs || a.sequence - b.sequence);

  const notes: PlayedNote[] = [];
  const openByPitch = new Map<number, PlayedNote[]>(); // 아직 NOTE_OFF를 못 만난 노트들

  for (const event of sorted) {
    if (event.type === 'NOTE_ON') {
      const note: PlayedNote = {
        midi: event.pitch,
        velocity: event.velocity,
        onSec: event.timestampMs / 1000,
        offSec: null,
      };
      notes.push(note);
      const open = openByPitch.get(event.pitch);
      if (open) open.push(note);
      else openByPitch.set(event.pitch, [note]);
    } else {
      const opened = openByPitch.get(event.pitch)?.shift();
      if (opened) opened.offSec = event.timestampMs / 1000;
    }
  }

  return notes;
}
