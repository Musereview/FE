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
    return () => {
      if (ref.current) {
        ref.current.stop();
        ref.current.dispose();
        ref.current = null;
      }
    };
  }, []);
  const start = useCallback(
    (bpm: number, beatsPerBar: number, onBeat: (time: number, beatInBar: number) => void) =>
      getMetronome().start(bpm, beatsPerBar, onBeat),
    [getMetronome],
  );
  const stop = useCallback(() => ref.current?.stop(), []);
  const pause = useCallback(() => ref.current?.pause(), []);
  const resume = useCallback(() => ref.current?.resume(), []);
  return { start, stop, pause, resume };
}
