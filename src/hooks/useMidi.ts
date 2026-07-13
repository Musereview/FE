// src/hooks/useMidi.ts
// Web MIDI API와의 통신을 전담하는 훅
import { useSettingStore } from '@/stores/settingsStore';
import { useEffect, useRef, useState } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
}
export type NoteHandler = (note: number, velocity: number, time: number) => void;

export function useMidi(
  onNoteOn?: NoteHandler,
  onNoteOff?: (note: number) => void,
  activeInputId?: string | null, // ← 선택된 기기 id (없으면 전체 수신)
) {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const accessRef = useRef<MIDIAccess | null>(null);

  // 핸들러를 ref로 유지 → 재렌더마다 리스너 재등록 방지
  const handlers = useRef({ onNoteOn, onNoteOff, activeInputId });
  handlers.current = { onNoteOn, onNoteOff, activeInputId };

  useEffect(() => {
    let cancelled = false;

    navigator
      .requestMIDIAccess()
      .then((access) => {
        if (cancelled) return;
        accessRef.current = access;

        const attach = () => {
          const list = [...access.inputs.values()];
          setInputs(list.map((i) => ({ id: i.id, name: i.name ?? 'Unknown' })));

          for (const input of list) {
            input.onmidimessage = (e) => {
              // 기기를 선택한 상태면, 그 기기의 입력만 처리
              const active = handlers.current.activeInputId;
              if (active && input.id !== active) return;

              const [status, note, velocity] = e.data!;
              const cmd = status & 0xf0;
              if (cmd === 0x90 && velocity > 0) {
                handlers.current.onNoteOn?.(note, velocity, e.timeStamp);
              } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
                handlers.current.onNoteOff?.(note);
              }
            };
          }
        };

        // attach 함수 안, onstatechange 부분을 이렇게
        access.onstatechange = (e) => {
          const port = e.port;
          // 입력 기기가 해제되면 그 기기의 레이턴시 삭제
          if (port && port.type === 'input' && port.state === 'disconnected') {
            useSettingStore.getState().clearLatency(port.id);
          }
          attach(); // 목록 갱신
        };
        attach(); // 최초 1회 실행
      })
      .catch(() => setError('MIDI 접근이 거부되었거나 지원되지 않는 브라우저입니다.'));

    return () => {
      cancelled = true;
    };
  }, []);

  return { inputs, error };
}
