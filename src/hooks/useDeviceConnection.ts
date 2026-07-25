// 선택된 MIDI 기기가 연습/학습 도중 끊겼는지 감지하는 훅
import { useEffect, useRef, useState } from 'react';
import type { MidiDevice } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';

export function useDeviceConnection(inputs: MidiDevice[]) {
  const { inputId } = useSettingStore();
  const [disconnected, setDisconnected] = useState(false);
  const wasConnectedRef = useRef(false); // 한 번이라도 연결된 적 있는지

  useEffect(() => {
    if (!inputId) return; // 선택된 기기 없음 -> 판별 X
    const connected = inputs.some((d) => d.id === inputId);
    if (connected) {
      wasConnectedRef.current = true;
      setDisconnected(false);
    } else if (wasConnectedRef.current) {
      setDisconnected(true); // 연결됐던 기기가 목록에서 사라짐 -> 끊김
    }
  }, [inputs, inputId]);

  return { disconnected };
}
