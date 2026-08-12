import { useCallback, useEffect, useRef } from 'react';
import { createMetronome, type Metronome } from '@/utils/metronome';

export function useMetronome() {
  const ref = useRef<Metronome | null>(null);
  const getMetronome = useCallback(() => {
    if (ref.current === null) {
      ref.current = createMetronome();
    }
    return ref.current;
  }, []);
  useEffect(() => {
    getMetronome(); // 마운트 시 미리 생성 — 클릭 사운드 버퍼 로딩을 최대한 일찍 시작시켜 첫 박 소리 유실 방지
    return () => {
      if (ref.current) {
        ref.current.stop();
        ref.current.dispose();
        ref.current = null;
      }
    };
  }, [getMetronome]);
  const start = useCallback(
    (
      bpm: number,
      beatsPerBar: number,
      onBeat: (time: number, beatInBar: number) => boolean | void,
      startOffsetSec = 0,
    ) => getMetronome().start(bpm, beatsPerBar, onBeat, startOffsetSec),
    [getMetronome],
  );
  const stop = useCallback((time?: number) => ref.current?.stop(time), []);
  const pause = useCallback(() => ref.current?.pause(), []);
  const resume = useCallback(() => ref.current?.resume(), []);
  // 클릭 사운드 버퍼 로딩이 끝날 때까지 대기 — 카운트다운 시작 전 호출해 소리·UI가 함께 시작되게 한다
  const ready = useCallback(() => getMetronome().ready, [getMetronome]);
  return { start, stop, pause, resume, ready };
}
