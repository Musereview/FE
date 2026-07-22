import { useEffect, useRef, useState, type RefObject } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { findMeasureIndexAtTime } from '@/utils/musicXmlTiming';
import type { CursorLike } from '@/types/osmd';

interface Params {
  osmdRef: RefObject<OpenSheetMusicDisplay | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  measureStartTimes: number[];
  isPlaying: boolean;
}

/**
 * 오디오 재생 시간을 감시하여 현재 마디 인덱스를 계산하고,
 * 마디가 바뀔 때만 OSMD 커서를 그 위치로 이동시킨다.
 * (매 프레임 React 상태 갱신은 마디가 실제로 바뀔 때만 일어나므로 리렌더링 비용이 낮다)
 */
export function useScoreCursorSync({ osmdRef, audioRef, measureStartTimes, isPlaying }: Params) {
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

  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd) return;
    moveCursorToMeasure(osmd, currentMeasureIndex);
  }, [currentMeasureIndex, osmdRef]);

  return { currentMeasureIndex };
}

/**
 * OSMD 커서를 임의의 마디로 이동시킨다.
 * 뒤로 이동해야 하면 reset 후 다시 앞으로 진행한다(순방향 전제, seek-back은 드묾).
 *
 * 주의: iterator.CurrentMeasureIndex / EndReached 는 OSMD의 내부(공개) API이며
 * 설치된 OSMD 버전에 따라 이름이 다를 수 있다. 버전 업그레이드 시 확인 필요.
 */
function moveCursorToMeasure(osmd: OpenSheetMusicDisplay, targetMeasureIndex: number) {
  const cursor = osmd.cursor as unknown as CursorLike;
  if (!cursor?.iterator) return;

  if (cursor.iterator.CurrentMeasureIndex > targetMeasureIndex) {
    cursor.reset();
  }

  let safety = 0;
  while (!cursor.iterator.EndReached && cursor.iterator.CurrentMeasureIndex < targetMeasureIndex && safety < 10000) {
    cursor.next();
    safety++;
  }
  cursor.update();
}
