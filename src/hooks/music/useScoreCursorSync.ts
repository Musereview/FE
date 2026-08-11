import { useEffect, useRef, useState, type RefObject } from 'react';
import { findMeasureIndexAtTime } from '@/utils/musicXmlTiming';

interface Params {
  audioRefs: RefObject<HTMLAudioElement | null>[];
  measureStartTimes: number[];
  isPlaying: boolean;
}

export function useScoreCursorSync({ audioRefs, measureStartTimes, isPlaying }: Params) {
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || measureStartTimes.length === 0) return;

    const tick = () => {
      // readyState가 0이면 메타데이터조차 못 받은 상태 —> currentTime이 0에서 움직이지 않으므로 건너뜀
      const audio = audioRefs.map((ref) => ref.current).find((el) => el && el.readyState > 0);

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
  }, [isPlaying, audioRefs, measureStartTimes]);

  return { currentMeasureIndex };
}
