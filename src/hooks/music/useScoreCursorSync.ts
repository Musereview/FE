import { useEffect, useRef, useState, type RefObject } from 'react';
import { findMeasureIndexAtTime } from '@/utils/musicXmlTiming';

interface Params {
  audioRef: RefObject<HTMLAudioElement | null>;
  measureStartTimes: number[];
  isPlaying: boolean;
}

export function useScoreCursorSync({ audioRef, measureStartTimes, isPlaying }: Params) {
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || measureStartTimes.length === 0) return;

    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        const idx = findMeasureIndexAtTime(measureStartTimes, audio.currentTime);
        setCurrentMeasureIndex((prev) => (prev !== idx ? idx : prev));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, audioRef, measureStartTimes]);

  return { currentMeasureIndex };
}
