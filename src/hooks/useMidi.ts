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
    const attached = new Set<MIDIInput>(); // 언마운트 시 해제할 입력 포트

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
            attached.add(input);
            input.onmidimessage = (e) => {
              // input에서 선택한 기기만 처리 (미선택이면 아무 입력도 받지 않음)
              const active = handlers.current.activeInputId;
              if (input.id !== active) return;

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
      .catch(() => setError('MIDI 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.'));

    return () => {
      cancelled = true;

      for (const input of attached) input.onmidimessage = null;
      attached.clear();
      if (accessRef.current) {
        accessRef.current.onstatechange = null;
        accessRef.current = null;
      }
    };
  }, []);

  return { inputs, error };
}
