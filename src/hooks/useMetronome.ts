import { useCallback, useEffect, useRef } from 'react';
import { createMetronome, type Metronome } from '@/utils/metronome';

export function useMetronome() {
  const ref = useRef<Metronome | null>(null);
  if (ref.current === null) {
    ref.current = createMetronome();
  }

  useEffect(() => {
    const m = ref.current!;
    return () => {
      m.stop();
      m.dispose();
    };
  }, []);

  const start = useCallback(
    (bpm: number, beatsPerBar: number, onBeat: (time: number, beatInBar: number) => void) =>
      ref.current!.start(bpm, beatsPerBar, onBeat),
    [],
  );
  const stop = useCallback(() => ref.current!.stop(), []);

  return { start, stop };
}
