// src/hooks/useMidi.ts
// Web MIDI API와의 통신을 전담하는 훅
import { useEffect, useRef, useState } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
}
export type NoteHandler = (note: number, velocity: number, time: number) => void;

export function useMidi(onNoteOn?: NoteHandler, onNoteOff?: (note: number) => void) {
  const [inputs, setInputs] = useState<MidiDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const accessRef = useRef<MIDIAccess | null>(null);

  // 핸들러를 ref로 유지 → 재렌더마다 리스너 재등록 방지
  const handlers = useRef({ onNoteOn, onNoteOff });
  handlers.current = { onNoteOn, onNoteOff };

  useEffect(() => {
    let cancelled = false;

    if (!navigator.requestMIDIAccess) {
      setError('이 브라우저는 MIDI를 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.');
      return () => {
        cancelled = true;
      };
    }

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

        attach();
        access.onstatechange = attach; // 연결/해제 시 목록 갱신
      })
      .catch(() => setError('MIDI 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.'));

    return () => {
      cancelled = true;
    };
  }, []);

  return { inputs, error };
}
